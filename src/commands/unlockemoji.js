import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import { verifyEmojiString, sendErrorFeedback } from '../helpers/utilities.js';
import { mediaLinks } from '../helpers/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unlockemoji')
    .setDescription('Unlocks a specified emoji so it is accessible to everyone')
    .addStringOption((option) =>
      option
        .setName('emoji')
        .setDescription('The emoji to unlock. Can be either emoji object, emoji name, or emoji id.')
        .setRequired(true),
    ),
  async execute(interaction) {
    try {
      await interaction.deferReply();

      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.editReply({
          content: 'You do not have enough permissions to use this command.\nRequires **Administrator**.',
          ephemeral: true,
        });
      }

      const stringEmoji = interaction.options.getString('emoji');
      const verifiedEmoji = verifyEmojiString(stringEmoji);

      const findEmoji = await interaction.guild.emojis.cache.find(
        (emoji) => emoji.name === stringEmoji || emoji.id === stringEmoji,
      );
      const foundEmoji = findEmoji ? findEmoji : await interaction.guild.emojis.fetch(verifiedEmoji[3]);

      foundEmoji
        .edit({ roles: [`${interaction.guild.id}`] })
        .then((editedEmoji) => {
          const embed = new EmbedBuilder()
            .setTitle(`Unlocked ${editedEmoji} for role everyone.`)
            .setDescription(
              `If you've enjoyed this bot so far, please consider voting for it.\nIt helps the bot grow. 🙂\n${mediaLinks}`,
            );
          return interaction.editReply({ embeds: [embed] });
        })
        .catch((editEmojiError) => {
          switch (editEmojiError.message) {
            case 'Missing Permissions':
              interaction.editReply({
                embeds: [
                  sendErrorFeedback(interaction.commandName, 'Bot is missing `Manage Emojis And Stickers` permission.'),
                ],
              });
              break;
            default:
              console.error(
                `Command:\n${interaction.commandName}\nError Message:\n${editEmojiError.message
                }\nRaw Input:\n${interaction.options.getString('emoji')}\n${interaction.options.getRole('role')}`,
              );
              return interaction.editReply({
                embeds: [sendErrorFeedback(interaction.commandName)],
              });
          }
        });
    }
    catch (e) {
      switch (e.message) {
        case 'Cannot read properties of null (reading \'3\')':
          await interaction.editReply({
            embeds: [
              sendErrorFeedback(
                interaction.commandName,
                'Invalid input. No such server emoji found. Please try again.',
              ),
            ],
          });
          break;
        case 'Unknown Emoji':
          await interaction.editReply({
            embeds: [
              sendErrorFeedback(
                interaction.commandName,
                'Invalid input. No such server emoji found. Please try again.',
              ),
            ],
          });
          break;
        default:
          console.error(
            `Command:\n${interaction.commandName}\nError Message:\n${e.message
            }\nRaw Input:\n${interaction.options.getString('emoji')}\n${interaction.options.getRole('role')}`,
          );
          return await interaction.editReply({
            embeds: [sendErrorFeedback(interaction.commandName)],
          });
      }
    }
  },
};
