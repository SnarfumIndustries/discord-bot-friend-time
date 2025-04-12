const { REST, Routes } = require("discord.js");
const { clientId, guildId, token } = require("./config.json");
const fs = require("node:fs");
const path = require("node:path");

// Define your slash commands as JSON objects
const commands = [
    {
        name: "friendtime",
        description: "Converts given time to each friend’s local time.",
        options: [
            {
                name: "time",
                type: 3, // STRING type
                description: 'Time to convert, e.g. "4:00PM"',
                required: true,
            },
        ],
    },
];


// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    // Grab all the command files from the commands directory you created earlier
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith(".js"));
    // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ("data" in command && "execute" in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(
                `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
            );
        }
    }
}

// https://discord.com/api/oauth2/authorize?client_id=1360469833174487110&permissions=0&scope=bot%20applications.commands

