import { sendErrorFeedback } from '../helpers/utilities.js';
import { SlashCommandBuilder } from 'discord.js';

const clapifyText = (text) => `${text.replace(/ /g, ' 👏 ')} 👏`;

export default {
  data: new SlashCommandBuilder()
    .setName('clapify')
    .setDescription('Adds claps between words in a given text.')
    .addStringOption(option =>
      option.setName('text').setDescription('The text to clapify.').setRequired(true)
    ),
    
  async execute(interaction) {
    await interaction.deferReply();

    try {
      const text = interaction.options.getString('text');
      const clapified = clapifyText(text);

      if (clapified.length > 2000) {
        return await interaction.editReply({
          embeds: [
            sendErrorFeedback(
              interaction.commandName,
              '`text` must be less than 2000 characters after processing.'
            ),
          ],
        });
      }

      await interaction.editReply({ content: clapified });
    } catch (error) {
      console.error(`Command:\n${interaction.commandName}\nError:\n${error.stack}`);
      await interaction.editReply({
        embeds: [sendErrorFeedback(interaction.commandName)],
      });
    }
  },
};
