const { SlashCommandBuilder, inlineCode } = require("discord.js");
const moment = require("moment-timezone");

// Map Discord role names to IANA timezone strings
const timezoneMapping = {
    // North America
    EST: "America/New_York", // Eastern Standard/Daylight Time
    EDT: "America/New_York",
    CST: "America/Chicago", // Central Standard/Daylight Time
    CDT: "America/Chicago",
    MST: "America/Denver", // Mountain Standard/Daylight Time
    MDT: "America/Denver",
    PST: "America/Los_Angeles", // Pacific Standard/Daylight Time
    PDT: "America/Los_Angeles",
    AKST: "America/Anchorage", // Alaska Standard/Daylight Time
    AKDT: "America/Anchorage",
    HST: "Pacific/Honolulu", // Hawaii Standard Time (no DST)

    // Europe
    GMT: "Europe/London", // Greenwich Mean Time / Western European Time
    BST: "Europe/London", // British Summer Time
    CET: "Europe/Paris", // Central European Time
    CEST: "Europe/Paris", // Central European Summer Time
    EET: "Europe/Athens", // Eastern European Time
    EEST: "Europe/Athens", // Eastern European Summer Time
    MSK: "Europe/Moscow", // Moscow Standard Time

    // Asia
    IST: "Asia/Kolkata", // Indian Standard Time
    "CST-Asia": "Asia/Shanghai", // China Standard Time (using a disambiguated key)
    JST: "Asia/Tokyo", // Japan Standard Time
    KST: "Asia/Seoul", // Korea Standard Time

    // Australia / New Zealand
    AEST: "Australia/Sydney", // Australian Eastern Standard Time
    AEDT: "Australia/Sydney", // Australian Eastern Daylight Time
    ACST: "Australia/Adelaide", // Australian Central Standard Time
    ACDT: "Australia/Adelaide", // Australian Central Daylight Time
    AWST: "Australia/Perth", // Australian Western Standard Time
    NZST: "Pacific/Auckland", // New Zealand Standard Time
    NZDT: "Pacific/Auckland", // New Zealand Daylight Time

    // Africa
    EAT: "Africa/Nairobi", // East Africa Time
    CAT: "Africa/Harare", // Central Africa Time
    SAST: "Africa/Johannesburg", // South Africa Standard Time

    // South America
    ART: "America/Argentina/Buenos_Aires", // Argentina Time
    BRT: "America/Sao_Paulo", // Brasilia Time
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("friend-time")
        .setDescription("Get time for everyone else.")
        // Added a required string option for time input
        .addStringOption((option) =>
            option
                .setName("time")
                .setDescription("Time input in the format e.g. 4:00PM")
                .setRequired(true)
        ),
    async execute(interaction) {
        // Retrieve the time argument (expected format "4:00PM")
        const inputTimeStr = interaction.options.getString("time");

        // Parse the input time. The base date is today.
        const baseTime = moment(inputTimeStr, "h:mmA");
        if (!baseTime.isValid()) {
            console.error(
                `You borked it → Invalid time format: ${inputTimeStr}. Expected format: h:mmA`
            );
            return interaction.reply(
                "You borked it → Invalid time format. Use e.g. 4:00PM"
            );
        }

        // Refresh member list (if not already cached).
        const guild = interaction.guild;
        await guild.members.fetch();

        // Build the output list
        let replyStr = "converted times: \n";

        console.info(
            `User ${interaction.user.username} requested time for ${inputTimeStr}`
        );

        guild.members.cache.forEach((member) => {
            // Find a role that matches one of the timezone keys
            const tzRole = member.roles.cache.find(
                (role) => timezoneMapping[role.name]
            );
            if (tzRole) {
                const tzValue = timezoneMapping[tzRole.name];
                // Convert the time into the member's timezone and format it with abbreviation
                const convertedTime = baseTime.tz(tzValue).format("h:mm A z");
                replyStr += `→ ${member.displayName} ${inlineCode(
                    convertedTime
                )}\n`;
            }
        });

        await interaction.reply(replyStr);
    },
};
