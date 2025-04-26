import { sendErrorFeedback } from '../helpers/utilities.js';
import { SlashCommandBuilder } from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();

const dancifyText = (text, guild) => {
  let result = '';
  for (const char of text) {
    if (/[a-zA-Z0-9]/.test(char)) {
      const emoji = guild.emojis.cache.find(
        (emoji) => emoji.name === char.toLowerCase() + '_'
      );
      if (emoji) {
        result += emoji.toString();
      }
    } else if (char === ' ') {
      result += '    ';
    }
  }
  return result;
};

export default {
  data: new SlashCommandBuilder()
    .setName('dancify')
    .setDescription('Turns an input into a dancing text.')
    .addStringOption(option =>
      option.setName('text').setDescription('The text to dancify.').setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      let text = interaction.options.getString('text')
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .replace(/  +/g, ' ');

      if (!text.trim()) {
        await interaction.editReply({
          embeds: [
            sendErrorFeedback(
              interaction.commandName,
              '`text` must contain at least one alphanumerical character.\nSpecial characters and unicode inputs are ignored.'
            ),
          ],
        });
        return;
      }

      const guild = interaction.client.guilds.cache.get(process.env.GUILD_ID) 
        || await interaction.client.guilds.fetch(process.env.GUILD_ID);

      const danceText = dancifyText(text, guild);

      if (danceText.length > 2000) {
        await interaction.editReply({
          embeds: [
            sendErrorFeedback(
              interaction.commandName,
              '`text` must be less than 80 characters.\nIf you\'re wondering why so low, visit the support server and check the FAQ section in #important-info.'
            ),
          ],
        });
        return;
      }

      await interaction.editReply({ content: danceText });

    } catch (error) {
      console.error(`Command:\n${interaction.commandName}\nError:\n${error.stack}\nRaw Input:\n${interaction.options.getString('text')}`);
      await interaction.editReply({
        embeds: [sendErrorFeedback(interaction.commandName)],
      });
    }
  },
};
