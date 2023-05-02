import fs from 'fs';
import path from 'path';
import * as url from 'url';
import { REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const commands = [];
const commandsPath = path.join(__dirname, '../commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

(async () => {
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const commandModule = await import(url.pathToFileURL(filePath));
    const command = commandModule.default;
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    }
    else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }

  const rest = new REST().setToken(process.env.BOT_TOKEN);

  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    const data = await rest.put(
      // Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  }
  catch (error) {
    console.error(error);
  }
})();
