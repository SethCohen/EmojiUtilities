import { SlashCommandBuilder, PermissionsBitField, MessageFlags } from 'discord.js';
import { sendErrorFeedback } from '../helpers/utilities.js';
import converter from 'discord-emoji-converter';

export default {
  data: new SlashCommandBuilder()
    .setName('stickersteal')
    .setDescription('Steals a sticker by message id and uploads it to your server.')
    .addStringOption((option) =>
      option
        .setName('messageid')
        .setDescription('The message ID containing the sticker. (Developer Mode required to copy)')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('tag')
        .setDescription('The Discord unicode emoji to represent the sticker.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('name').setDescription('The name for the sticker.')
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      return interaction.editReply({
        content: 'You do not have enough permissions to use this command.\nRequires **Manage Emojis and Stickers**.',
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const messageId = interaction.options.getString('messageid');
      const stickerName = interaction.options.getString('name');
      let stickerTag = interaction.options.getString('tag');

      const message = await interaction.channel.messages.fetch(messageId);
      const fetchedSticker = message.stickers.first();

      if (!fetchedSticker) {
        return interaction.editReply({
          embeds: [sendErrorFeedback(interaction.commandName, 'No sticker found in message. Please try again.')],
        });
      }

      // Convert unicode emoji to Discord format
      stickerTag = converter.getShortcode(stickerTag, false);

      const createdSticker = await interaction.guild.stickers.create({
        file: fetchedSticker.url,
        name: stickerName || fetchedSticker.name,
        tags: stickerTag,
      });

      await interaction.editReply({
        content: `✅ Created new sticker: **${createdSticker.name}**!`,
      });

    } catch (error) {
      const messageNotFoundErrors = [
        'Invalid Form Body\nmessage_id[NUMBER_TYPE_COERCE]',
        'Invalid Form Body\nmessage_id[NUMBER_TYPE_MAX]',
        'Unknown Message',
        '404: Not Found',
      ];

      const stickerSlotErrors = [
        'Maximum number of stickers reached (5)',
        'Maximum number of stickers reached (15)',
        'Maximum number of stickers reached (30)',
        'Maximum number of stickers reached (60)',
      ];

      if (messageNotFoundErrors.some((msg) => error.message.includes(msg))) {
        return interaction.editReply({
          embeds: [sendErrorFeedback(interaction.commandName, 'Message not found. Make sure `messageId` is correct and command is run in the same channel as sticker.')],
        });
      }

      if (stickerSlotErrors.includes(error.message)) {
        return interaction.editReply({
          embeds: [sendErrorFeedback(interaction.commandName, 'No sticker slots available in server.')],
        });
      }

      if (error.message === "Emoji doesn't exist") {
        return interaction.editReply({
          embeds: [sendErrorFeedback(interaction.commandName, 'Emoji in `tag` not found. Please use a default emoji, such as 🍌')],
        });
      }

      if (error.message === 'Missing Access') {
        return interaction.editReply({
          embeds: [sendErrorFeedback(interaction.commandName, 'Bot missing `View Channel` permission. Please fix bot permissions and try again.')],
        });
      }

      console.error(`
**Command:** ${interaction.commandName}
**Error Message:** ${error.message}
**Raw Input:**
- messageId: ${interaction.options.getString('messageid')}
- name: ${interaction.options.getString('name')}
- tag: ${interaction.options.getString('tag')}
      `);

      return interaction.editReply({
        embeds: [sendErrorFeedback(interaction.commandName)],
      });
    }
  },
};
