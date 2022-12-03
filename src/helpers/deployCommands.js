import fs from 'fs';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

// eslint-disable-next-line no-unused-vars
import config from '../../config.json' assert { type: "json" };

const commands = [];
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`../commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
	try {
		await rest.put(
			// Routes.applicationGuildCommands(config.clientId, config.guildId), // <-- Guild version
			Routes.applicationCommands(config.clientId), // <-- Global version
			{ body: commands },
		);

		console.log('Successfully registered application commands.');
	}
	catch (error) {
		console.error(`deployCommands.js error\n${error}`);
	}
})();