import fs from 'fs';
import path from 'path';
import * as url from 'url';
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.User, Partials.Channel, Partials.Reaction],
});

// Commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
(async () => {
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = (await import(url.pathToFileURL(filePath))).default;
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    }
    else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
})();

// Events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));
(async () => {
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = (await import(url.pathToFileURL(filePath))).default;
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    }
    else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
})();

// MongoDB
const mongoClient = new MongoClient(process.env.MONGODB_URI);
(async () => {
  try {
    await mongoClient.connect();

    const db = mongoClient.db('data');
    client.db = db;

    client.login(process.env.BOT_TOKEN);
  }
  catch (error) {
    console.error('Error connecting to MongoDB:', error);
    mongoClient.close();
  }
})();
