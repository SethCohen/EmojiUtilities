import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

// Resolve __dirname in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Extend Client to hold our db and commands collection
/**
 * @typedef {import('discord.js').Client & { commands: Collection<string, any>, db?: import('mongodb').Db }} BotClient
 */

/** @type {BotClient} */
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
client.commands = new Collection();

/**
 * Load and register command modules
 */
async function loadCommands() {
  const commandsDir = path.join(__dirname, 'commands');
  const files = (await fs.readdir(commandsDir)).filter(f => f.endsWith('.js'));
  await Promise.all(
    files.map(async file => {
      const filePath = path.join(commandsDir, file);
      const { default: cmd } = await import(pathToFileURL(filePath).href);
      if (cmd?.data?.name && typeof cmd.execute === 'function') {
        client.commands.set(cmd.data.name, cmd);
      } else {
        console.warn(`[WARNING] ${file} is missing a valid data or execute export.`);
      }
    })
  );
}

/**
 * Load and attach event handlers
 */
async function loadEvents() {
  const eventsDir = path.join(__dirname, 'events');
  const files = (await fs.readdir(eventsDir)).filter(f => f.endsWith('.js'));
  await Promise.all(
    files.map(async file => {
      const filePath = path.join(eventsDir, file);
      const { default: evt } = await import(pathToFileURL(filePath).href);
      const listener = (...args) => evt.execute(...args).catch(console.error);
      if (evt.once) client.once(evt.name, listener);
      else client.on(evt.name, listener);
    })
  );
}

/**
 * Main initialization
 */
async function init() {
  try {
    await loadCommands();
    await loadEvents();

    const mongoClient = new MongoClient(process.env.MONGODB_URI, { useUnifiedTopology: true });
    await mongoClient.connect();
    client.db = mongoClient.db('data');

    await client.login(process.env.BOT_TOKEN);

    // Graceful shutdown
    const cleanExit = async () => {
      console.log('Shutting down...');
      await mongoClient.close();
      process.exit(0);
    };
    process.on('SIGINT', cleanExit);
    process.on('SIGTERM', cleanExit);
  } catch (err) {
    console.error('❌ Initialization error:', err);
    process.exit(1);
  }
}

init();
