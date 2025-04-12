// Require dependencies
const { Client, GatewayIntentBits } = require("discord.js");
const moment = require("moment-timezone"); // Alternatively, use Luxon if preferred.

// Create a new client instance with intent to fetch guild members.
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

// Map Discord role names to IANA timezone strings
const timezoneMapping = {
    EDT: "America/New_York",
    GMT: "Europe/London",
    // add additional mappings as needed
};

// Register command (once) via your preferred method or using discord.js’s REST API.
// For this example, assume a slash command called 'friendtime' with a string option 'time'.

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "friendtime") {
        // Retrieve the time argument (expected format "4:00PM")
        const inputTimeStr = interaction.options.getString("time");

        // Parse the input time. The base date is today.
        const baseTime = moment(inputTimeStr, "h:mmA");
        if (!baseTime.isValid()) {
            return interaction.reply("Invalid time format. Use e.g. 4:00PM");
        }

        // Refresh member list (if not already cached).
        const guild = interaction.guild;
        await guild.members.fetch();

        // Build the output list
        let replyStr = "Check out this time and date:\n";

        guild.members.cache.forEach((member) => {
            // Find a role that matches one of the timezone keys
            const tzRole = member.roles.cache.find(
                (role) => timezoneMapping[role.name]
            );
            if (tzRole) {
                const tzValue = timezoneMapping[tzRole.name];
                // Convert the time into the member's timezone and format it with abbreviation
                const convertedTime = baseTime.tz(tzValue).format("h:mm A z");
                replyStr += `- ${member.displayName} ${convertedTime}\n`;
            }
        });

        await interaction.reply(replyStr);
    }
});

// Log into Discord with your bot's token (store in environment variable for security)
client.login(process.env.DISCORD_BOT_TOKEN);
