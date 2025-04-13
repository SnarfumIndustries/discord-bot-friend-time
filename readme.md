# Friend Time Discord Bot

A Discord bot that converts time across different timezones for server members based on their assigned timezone roles.

## Features

- Convert user-specified times across multiple timezones
- Display localized times for all server members with timezone roles
- Support for both 12-hour and 24-hour time formats
- Visual indicators (emoji) for day/night/sleep based on local time

## Prerequisites

- Node.js 16.9.0 or higher
- Discord Bot Token
- Server with appropriate permissions

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file in the root directory with:

   ```env
   DISCORD_BOT_TOKEN=your_bot_token
   CLIENT_ID=your_client_id
   GUILD_ID=your_guild_id
   ```

## Setup

1. Register commands with Discord: `npm run deploy-commands`
2. Start the bot: `npm run start`

## Usage

Create timezone roles on your Discord server with the following naming format:

- `TZ:EST`, `TZ:PST`, etc. (see the complete list in the `friend-time.js` file)

Assign these roles to users based on their timezone.

Use the `/friend-time` slash command with an optional time parameter:

- `/friend-time` - Shows current time for all users
- `/friend-time time:3PM` - Shows 3PM converted to everyone's timezone
- `/friend-time time:14:30` - Shows 14:30 (24-hour format) for everyone

## Supported Timezones

The bot supports various timezones across North America, Europe, Asia, Australia/New Zealand, Africa, and South America. Each timezone is mapped to a specific IANA timezone identifier.

## Commands Management

- `npm run deploy-commands` - Deploys slash commands to your server
- `node delete-commands.js` - Removes all commands from your server

## License

MIT License
