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

const twelveHourTimeFormat = "h:mm A z"; // 12-hour format with AM/PM and timezone
const twentyFourHourTimeFormat = "H:mm z"; // 24-hour format for European zones
const exampleFormat = "e.g. 2PM, 4:00PM or 13, 14:00, 16:00";

// Helper to choose an emoji based on the hour (in the given timezone)
function getEmojiForTime(moment) {
    const hour = moment.hour();
    if (hour >= 7 && hour < 18) {
        return "☀️"; // day
    } else if (hour >= 18 && hour <= 24) {
        return "🌙"; // night
    } else {
        return "💤"; // sleep
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("friend-time")
        .setDescription("Get localized time for everyone.")
        .addStringOption((option) =>
            option
                .setName("time")
                .setDescription(exampleFormat)
                .setRequired(false)
        ),
    async execute(interaction) {
        let inputTimeStr = interaction.options.getString("time");
        console.info(
            `User ${interaction.user.username} requested time for ${
                inputTimeStr ?? "now"
            }`
        );

        if (!inputTimeStr) {
            inputTimeStr = new Date().toLocaleTimeString();
        }

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

        // Use format based on the user who interacted timezone
        const interactionTzRole = interaction.member.roles.cache.find(
            (role) => timezoneMapping[role.name]
        );
        const interactionTzValue = timezoneMapping[interactionTzRole.name];
        const formatString = interactionTzValue.startsWith("Europe/")
            ? twentyFourHourTimeFormat
            : twelveHourTimeFormat;

        guild.members.cache.forEach((member) => {
            const tzRole = member.roles.cache.find(
                (role) => timezoneMapping[role.name]
            );
            if (tzRole) {
                const tzValue = timezoneMapping[tzRole.name];
                const convertedMoment = moment(baseTime)
                    .tz(tzValue)
                    .format(formatString);
                const emoji = getEmojiForTime(moment(baseTime).tz(tzValue));

                if (!timeGroups[convertedMoment]) {
                    timeGroups[convertedMoment] = {
                        users: [],
                        tz: tzValue,
                        emoji,
                    };
                }
                timeGroups[convertedMoment].users.push(member.displayName);
            }
        });

        // Sort timestamps in ascending order
        const sortedTimes = Object.keys(timeGroups).sort((a, b) =>
            moment(a, twelveHourTimeFormat).diff(moment(b, twelveHourTimeFormat))
        );

        let replyStr = `${interaction.user.username} checked time for ${inputTimeStr}:\n`;

        for (const time of sortedTimes) {
            const { users, tz, emoji } = timeGroups[time];
            users.sort(); // Sort users alphabetically
            replyStr += `${emoji} ${inlineCode(time)}: ${users.join(", ")}\n`;
        }

        await interaction.reply(replyStr);
    },
};
