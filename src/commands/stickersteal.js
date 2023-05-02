import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import { sendErrorFeedback } from '../helpers/utilities.js';
import converter from 'discord-emoji-converter';

export default {
  data: new SlashCommandBuilder()
    .setName('stickersteal')
    .setDescription('Steals a sticker by message id and uploads it to your server.')
    .addStringOption((option) =>
      option
        .setName('messageid')
        .setDescription(
          'The message id that contains the sticker. Requires Developer Mode enable in Discord Settings to get.',
        )
        .setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('tag').setDescription('The Discord unicode emoji to represent the sticker.').setRequired(true),
    )
    .addStringOption((option) => option.setName('name').setDescription('The name for the sticker.')),
  async execute(interaction) {
    await interaction.deferReply();

    try {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
        return interaction.editReply({
          content: 'You do not have enough permissions to use this command.\nRequires **Manage Emojis**.',
          ephemeral: true,
        });
      }

      const messageId = interaction.options.getString('messageid');
      const stickerName = interaction.options.getString('name');
      let stickerTag = interaction.options.getString('tag');

      const message = await interaction.channel.messages.fetch(messageId);
      const fetchedSticker = message.stickers.first();

      // Convert unicode emoji to discord string name
      stickerTag = converter.getShortcode(stickerTag, false);

      interaction.guild.stickers
        .create({
          file: fetchedSticker.url,
          name: stickerName ? stickerName : fetchedSticker.name,
          tags: stickerTag,
        })
        .then((createdSticker) => {
          return interaction.editReply({
            content: `Created new sticker with name **${createdSticker.name}**!`,
          });
        })
        .catch((error) => {
          switch (error.message) {
            case 'Maximum number of stickers reached (5)':
              interaction.editReply({
                embeds: [sendErrorFeedback(interaction.commandName, 'No sticker slots available in server.')],
              });
              break;
            case 'Maximum number of stickers reached (15)':
              interaction.editReply({
                embeds: [sendErrorFeedback(interaction.commandName, 'No sticker slots available in server.')],
              });
              break;
            case 'Maximum number of stickers reached (30)':
              interaction.editReply({
                embeds: [sendErrorFeedback(interaction.commandName, 'No sticker slots available in server.')],
              });
              break;
            case 'Maximum number of stickers reached (60)':
              interaction.editReply({
                embeds: [sendErrorFeedback(interaction.commandName, 'No sticker slots available in server.')],
              });
              break;
            default:
              console.error(
                `**Command:**\n${interaction.commandName}\n**Error Message:**\n${error.message
                }\n**Raw Input:**\n${interaction.options.getString('messageid')}\n${interaction.options.getString(
                  'name',
                )}\n${interaction.options.getString('tag')}`,
              );
              return interaction.editReply({
                embeds: [sendErrorFeedback(interaction.commandName)],
              });
          }
        });
    }
    catch (e) {
      if (e.message.includes('Invalid Form Body\nmessage_id[NUMBER_TYPE_COERCE]')) {
        return interaction.editReply({
          embeds: [
            sendErrorFeedback(
              interaction.commandName,
              'Message not found. Make sure `messageId` is correct and command is run in same channel as sticker.',
            ),
          ],
        });
      }
      if (e.message.includes('Invalid Form Body\nmessage_id[NUMBER_TYPE_MAX]')) {
        return interaction.editReply({
          embeds: [
            sendErrorFeedback(
              interaction.commandName,
              'Message not found. Make sure `messageId` is correct and command is run in same channel as sticker.',
            ),
          ],
        });
      }

      switch (e.message) {
        case 'Emoji doesn\'t exist':
          await interaction.editReply({
            embeds: [
              sendErrorFeedback(
                interaction.commandName,
                'Emoji in `tag` not found. Please use a default emoji, such as 🍌',
              ),
            ],
          });
          break;
        case 'Unknown Message':
          await interaction.editReply({
            embeds: [
              sendErrorFeedback(
                interaction.commandName,
                'Message not found. Make sure `messageId` is correct and command is run in same channel as sticker.',
              ),
            ],
          });
          break;
        case 'Cannot read properties of undefined (reading \'url\')':
          await interaction.editReply({
            embeds: [sendErrorFeedback(interaction.commandName, 'No sticker found in message. Please try again.')],
          });
          break;
        case '404: Not Found':
          await interaction.editReply({
            embeds: [
              sendErrorFeedback(
                interaction.commandName,
                'Message not found. Make sure `messageId` is correct and command is run in same channel as sticker.',
              ),
            ],
          });
          break;
        case 'Missing Access':
          await interaction.editReply({
            embeds: [
              sendErrorFeedback(
                interaction.commandName,
                'Bot missing `View Channel` permission for channel sticker is in. Please fix channel or bot permissions and try again.',
              ),
            ],
          });
          break;
        default:
          console.error(
            `**Command:**\n${interaction.commandName}\n**Error Message:**\n${e.message
            }\n**Raw Input:**\n${interaction.options.getString('messageid')}\n${interaction.options.getString(
              'tag',
            )}\n${interaction.options.getString('name')}`,
          );
          return await interaction.editReply({
            embeds: [sendErrorFeedback(interaction.commandName)],
          });
      }
    }
  },
};
