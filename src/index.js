import fs from 'fs';
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import config from '../config.json' assert { type: "json" };

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.MessageContent,
	],
	partials: [
		Partials.Message,
		Partials.User,
		Partials.Channel,
		Partials.Reaction,
	],
});

// Commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const { default: command } = await import(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

// Events
const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const { default: event } = await import(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(config.token);