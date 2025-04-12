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

        let baseTime = moment(inputTimeStr, ["h:mmA", "hA", "h:mm A", "h A"]);
        if (!baseTime.isValid()) {
            baseTime = moment(inputTimeStr, ["HH:mm", "H:mm"]);
        }

        if (!baseTime.isValid()) {
            console.error(
                `You borked it → Invalid time format: ${inputTimeStr}. Expected format: ${exampleFormat}`
            );
            return interaction.reply(
                "You borked it → Invalid time format." + exampleFormat
            );
        }

        const guild = interaction.guild;
        await guild.members.fetch();

        console.info(
            `User ${interaction.user.username} requested time for ${inputTimeStr}`
        );

        const timeGroups = {};

        guild.members.cache.forEach((member) => {
            const tzRole = member.roles.cache.find(
                (role) => timezoneMapping[role.name]
            );
            if (tzRole) {
                const tzValue = timezoneMapping[tzRole.name];
                const convertedMoment = moment(baseTime).tz(tzValue);
                const convertedTime = convertedMoment.format("h:mm A z");

                if (!timeGroups[convertedTime]) {
                    timeGroups[convertedTime] = [];
                }
                timeGroups[convertedTime].push(member.displayName);
            }
        });

        let replyStr = `${interaction.user.username} checked time for ${inputTimeStr}:\n`;

        for (const time in timeGroups) {
            const users = timeGroups[time];
            users.sort();
            replyStr += `→ ${inlineCode(time)}: ${users.join(", ")}\n`;
        }

        await interaction.reply(replyStr);
    },
};
