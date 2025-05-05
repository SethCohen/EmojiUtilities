import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField, MessageFlags } from 'discord.js';
import { verifyEmojiString, sendErrorFeedback } from '../helpers/utilities.js';
import { mediaLinks } from '../helpers/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unlockemoji')
    .setDescription('Unlocks a specified emoji so it is accessible to everyone.')
    .addStringOption((option) =>
      option
        .setName('emoji')
        .setDescription('The emoji to unlock. Can be emoji object, name, or ID.')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      return interaction.editReply({
        content: 'You do not have enough permissions to use this command.\nRequires **Administrator**.',
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const stringEmoji = interaction.options.getString('emoji');
      const verifiedEmoji = verifyEmojiString(stringEmoji);

      // Try to find the emoji either by name or ID
      const findEmoji = interaction.guild.emojis.cache.find(
        (emoji) => emoji.name === stringEmoji || emoji.id === stringEmoji
      );

      const foundEmoji = findEmoji
        ? findEmoji
        : await interaction.guild.emojis.fetch(verifiedEmoji[3]);

      if (!foundEmoji) {
        return interaction.editReply({
          embeds: [
            sendErrorFeedback(interaction.commandName, 'Invalid input. No such server emoji found.'),
          ],
        });
      }

      const editedEmoji = await foundEmoji.edit({ roles: [interaction.guild.id] });

      const embed = new EmbedBuilder()
        .setTitle(`✅ Unlocked ${editedEmoji} for @everyone.`)

      return interaction.editReply({ embeds: [embed] });

    } catch (error) {
      const missingEmojiErrors = [
        "Cannot read properties of null (reading '3')",
        'Unknown Emoji',
      ];

      if (missingEmojiErrors.includes(error.message)) {
        return interaction.editReply({
          embeds: [
            sendErrorFeedback(
              interaction.commandName,
              'Invalid input. No such server emoji found. Please try again.'
            ),
          ],
        });
      }

      if (error.message === 'Missing Permissions') {
        return interaction.editReply({
          embeds: [
            sendErrorFeedback(
              interaction.commandName,
              'Bot is missing `Manage Emojis And Stickers` permission.'
            ),
          ],
        });
      }

      console.error(`
**Command:** ${interaction.commandName}
**Error Message:** ${error.message}
**Raw Input:**
- emoji: ${interaction.options.getString('emoji')}
      `);

      return interaction.editReply({
        embeds: [sendErrorFeedback(interaction.commandName)],
      });
    }
  },
};
