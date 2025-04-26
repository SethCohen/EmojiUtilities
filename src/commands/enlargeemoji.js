import { sendErrorFeedback, verifyEmojiString } from '../helpers/utilities.js';
import { SlashCommandBuilder } from 'discord.js';

const getEmojiUrl = (emoji) => 
  `https://cdn.discordapp.com/emojis/${emoji[3]}.${emoji[1] ? 'gif' : 'png'}`;

export default {
  data: new SlashCommandBuilder()
    .setName('enlargeemoji')
    .setDescription("Pastes a custom emoji's URL to chat.")
    .addStringOption(option =>
      option.setName('emoji').setDescription('The emoji to display.').setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const stringEmoji = interaction.options.getString('emoji');
      const verifiedEmoji = verifyEmojiString(stringEmoji);

      if (!verifiedEmoji) {
        return await interaction.editReply({
          embeds: [sendErrorFeedback(interaction.commandName, 'No emoji found in `emoji`.')],
        });
      }

      const url = getEmojiUrl(verifiedEmoji);
      await interaction.editReply({ content: url });

    } catch (error) {
      console.error(`Command:\n${interaction.commandName}\nError:\n${error.stack}\nRaw Input:\n${interaction.options.getString('emoji')}`);
      await interaction.editReply({
        embeds: [sendErrorFeedback(interaction.commandName)],
      });
    }
  },
};
