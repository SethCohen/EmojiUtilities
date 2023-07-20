import { sendErrorFeedback } from '../helpers/utilities.js';
import { SlashCommandBuilder } from 'discord.js';

const clapifyText = (text) => {
  return `${text.replace(/ /g, ' 👏 ')} 👏`;
};

export default {
  data: new SlashCommandBuilder()
    .setName('clapify')
    .setDescription('Adds claps between words in a given text.')
    .addStringOption((option) =>
      option.setName('text').setDescription('The text to clapify.').setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();

    const text = interaction.options.getString('text');

    try {
      return await interaction.editReply({ content: clapifyText(text) });
    } catch (error) {
      switch (error.message) {
        case 'Invalid Form Body\ndata.content: Must be 2000 or fewer in length.':
          await interaction.editReply({
            embeds: [
              sendErrorFeedback(
                interaction.commandName,
                '`text` must be less than 2000 characters.'
              ),
            ],
          });
          break;
        default:
          console.error(
            `Command:\n${interaction.commandName}\nError Message:\n${
              error.message
            }\nRaw Input:\n${interaction.options.getString('text')}`
          );
          return await interaction.editReply({
            embeds: [sendErrorFeedback(interaction.commandName)],
          });
      }
    }
  },
};
