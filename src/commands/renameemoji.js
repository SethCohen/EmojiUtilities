import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import { sendErrorFeedback, verifyEmojiString } from '../helpers/utilities.js';
import { mediaLinks } from '../helpers/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('renameemoji')
    .setDescription('Renames a specified custom emoji.')
    .addStringOption(option =>
      option.setName('emoji').setDescription('The emoji to rename.').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('name').setDescription('The new name for the emoji.').setRequired(true)
    ),

  async execute(interaction) {
    try {
      await interaction.deferReply();

      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
        return await interaction.editReply({
          content: 'You do not have enough permissions to use this command.\nRequires **Manage Emojis**.',
          ephemeral: true,
        });
      }

      const emojiInput = interaction.options.getString('emoji');
      const nameInput = interaction.options.getString('name');
      const verifiedEmoji = verifyEmojiString(emojiInput);

      if (!verifiedEmoji || !verifiedEmoji[3]) {
        return await interaction.editReply({
          embeds: [sendErrorFeedback(interaction.commandName, 'No emoji found in `emoji`.')],
        });
      }

      const emoji = await interaction.guild.emojis.fetch(verifiedEmoji[3]).catch(error => {
        if (error.message === 'Unknown Emoji') {
          return null;
        }
        throw error;
      });

      if (!emoji) {
        return await interaction.editReply({
          embeds: [
            sendErrorFeedback(
              interaction.commandName,
              'No valid emoji found in `emoji`.\nMake sure emoji is from this server.'
            ),
          ],
        });
      }

      try {
        const updatedEmoji = await emoji.edit({ name: nameInput });

        const embed = new EmbedBuilder()
          .setTitle(`${updatedEmoji} has been renamed to ${updatedEmoji.name}.`)
          .setDescription(
            `If you've enjoyed this bot so far, please consider voting for it.\nIt helps the bot grow. 🙂\n${mediaLinks}`
          );

        return await interaction.editReply({ embeds: [embed] });

      } catch (error) {
        return await handleEditError(error, interaction);
      }

    } catch (error) {
      console.error(
        `Command:\n${interaction.commandName}\nError Message:\n${error.message}\nRaw Input:\n${interaction.options.getString('emoji')}\n${interaction.options.getString('name')}`
      );
      return await interaction.editReply({
        embeds: [sendErrorFeedback(interaction.commandName)],
      });
    }
  },
};

// --- Helper function for rename errors ---
async function handleEditError(error, interaction) {
  let errorMessage;

  if (error.message.includes('name: Must be between 2 and 32 in length')) {
    errorMessage = 'Invalid value in `name`.\nMust be between 2 to 32 characters in length.';
  } else if (error.message.includes('name: String value did not match validation regex')) {
    errorMessage = 'Invalid value in `name`.\nMust only contain alphanumeric characters and underscores.';
  } else if (error.message.includes('Missing Permissions')) {
    errorMessage = 'Bot is missing `Manage Emojis And Stickers` permission.';
  }

  if (errorMessage) {
    return await interaction.editReply({
      embeds: [sendErrorFeedback(interaction.commandName, errorMessage)],
    });
  }

  console.error(
    `Command:\n${interaction.commandName}\nError Message:\n${error.message}\nRaw Input:\n${interaction.options.getString('emoji')}\n${interaction.options.getString('name')}`
  );

  return await interaction.editReply({
    embeds: [sendErrorFeedback(interaction.commandName)],
  });
}
