const { REST, Routes } = require("discord.js");
const dotenv = require("dotenv");
dotenv.config();

const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN);

// for guild-based commands
rest.put(
    Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
    ),
    { body: [] }
)
    .then(() => console.log("Successfully deleted all guild commands."))
    .catch(console.error);

// for global commands
/* rest.put(Routes.applicationCommands(clientId), { body: [] })
    .then(() => console.log("Successfully deleted all application commands."))
    .catch(console.error); */
