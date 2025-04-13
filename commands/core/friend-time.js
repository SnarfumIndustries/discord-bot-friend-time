const { SlashCommandBuilder, inlineCode } = require("discord.js");
const moment = require("moment-timezone");

const timezoneMapping = {
    // North America
    "TZ:EST": "America/New_York",
    "TZ:EDT": "America/New_York",
    "TZ:CST": "America/Chicago",
    "TZ:CDT": "America/Chicago",
    "TZ:MST": "America/Denver",
    "TZ:MDT": "America/Denver",
    "TZ:PST": "America/Los_Angeles",
    "TZ:PDT": "America/Los_Angeles",
    "TZ:AKST": "America/Anchorage",
    "TZ:AKDT": "America/Anchorage",
    "TZ:HST": "Pacific/Honolulu",

    // Europe
    "TZ:GMT": "Europe/London",
    "TZ:BST": "Europe/London",
    "TZ:CET": "Europe/Paris",
    "TZ:CEST": "Europe/Paris",
    "TZ:EET": "Europe/Athens",
    "TZ:EEST": "Europe/Athens",
    "TZ:MSK": "Europe/Moscow",

    // Asia
    "TZ:IST": "Asia/Kolkata",
    "TZ:CST-Asia": "Asia/Shanghai",
    "TZ:JST": "Asia/Tokyo",
    "TZ:KST": "Asia/Seoul",

    // Australia / New Zealand
    "TZ:AEST": "Australia/Sydney",
    "TZ:AEDT": "Australia/Sydney",
    "TZ:ACST": "Australia/Adelaide",
    "TZ:ACDT": "Australia/Adelaide",
    "TZ:AWST": "Australia/Perth",
    "TZ:NZST": "Pacific/Auckland",
    "TZ:NZDT": "Pacific/Auckland",

    // Africa
    "TZ:EAT": "Africa/Nairobi",
    "TZ:CAT": "Africa/Harare",
    "TZ:SAST": "Africa/Johannesburg",

    // South America
    "TZ:ART": "America/Argentina/Buenos_Aires",
    "TZ:BRT": "America/Sao_Paulo",
};

const exampleFormat = "e.g. 2PM, 4:00PM or 13, 14:00, 16:00";

// Helper to choose an emoji based on the hour (in the given timezone)
function getEmojiForTime(timeStr, tz) {
    // Create a moment from the time string using the stored timezone.
    const m = moment.tz(timeStr, "h:mm A z", tz);
    const hour = m.hour();
    if (hour >= 5 && hour < 12) {
        return "🌅"; // morning
    } else if (hour >= 12 && hour < 17) {
        return "☀️"; // afternoon
    } else if (hour >= 17 && hour < 21) {
        return "🌇"; // evening
    } else {
        return "🌙"; // night
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("friend-time")
        .setDescription("Get time for everyone else.")
        .addStringOption((option) =>
            option
                .setName("time")
                .setDescription(exampleFormat)
                .setRequired(true)
        ),
    async execute(interaction) {
        const inputTimeStr = interaction.options.getString("time");
        console.info(
            `User ${interaction.user.username} requested time for ${inputTimeStr}`
        );

        // Parse the input time (supports 12-hour and 24-hour formats)
        let baseTime = moment(inputTimeStr, ["h:mmA", "hA", "h:mm A", "h A"]);
        if (!baseTime.isValid()) {
            baseTime = moment(inputTimeStr, ["HH:mm", "H:mm"]);
        }
        if (!baseTime.isValid()) {
            console.error(
                `Invalid time format: ${inputTimeStr}. Expected format: ${exampleFormat}`
            );
            return interaction.reply(
                "You borked it → Invalid time format." + exampleFormat
            );
        }

        const guild = interaction.guild;
        await guild.members.fetch();

        // Use a numeric timestamp as key for easy chronological sorting.
        // Also store the timezone used so that the moment can be recreated correctly.
        const timeGroups = {};

        guild.members.cache.forEach((member) => {
            const tzRole = member.roles.cache.find(
                (role) => timezoneMapping[role.name]
            );
            if (tzRole) {
                const tzValue = timezoneMapping[tzRole.name];
                const convertedMoment = moment(baseTime)
                    .tz(tzValue)
                    .format("h:mm A z");

                console.info(`User ${member.displayName} - ${convertedMoment}`);

                if (!timeGroups[convertedMoment]) {
                    timeGroups[convertedMoment] = { users: [], tz: tzValue };
                }
                timeGroups[convertedMoment].users.push(member.displayName);
            }
        });

        console.info(`Time groups: ${JSON.stringify(timeGroups, null, 2)}`);

        // Sort timestamps in ascending order
        const sortedTimes = Object.keys(timeGroups).sort((a, b) =>
            moment(a, "h:mm A z").diff(moment(b, "h:mm A z"))
        );

        console.info(
            `Sorted timestamps: ${JSON.stringify(sortedTimes, null, 2)}`
        );

        let replyStr = `${interaction.user.username} checked time for ${inputTimeStr}:\n`;

        for (const time of sortedTimes) {
            const { users, tz } = timeGroups[time];
            users.sort(); // Sort users alphabetically
            const emoji = getEmojiForTime(time, tz);
            replyStr += `${emoji} ${inlineCode(time)}: ${users.join(", ")}\n`;
            // replyStr += `→ ${inlineCode(time)}: ${users.join(", ")}\n`;
        }

        await interaction.reply(replyStr);
    },
};
