import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import { verifyEmojiString, sendErrorFeedback } from '../helpers/utilities.js';
import { mediaLinks } from '../helpers/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('lockemoji')
    .setDescription('Restricts a specified server-emoji to a specific role.')
    .addStringOption(option =>
      option.setName('emoji')
        .setDescription('The emoji to restrict.')
        .setRequired(true)
    )
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role that has access to the emoji.')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.editReply({
        content: 'You do not have enough permissions to use this command.\nRequires **Administrator**.',
        ephemeral: true,
      });
    }

    try {
      const role = interaction.options.getRole('role');
      const stringEmoji = interaction.options.getString('emoji');
      const verifiedEmoji = verifyEmojiString(stringEmoji);

      if (!verifiedEmoji) {
        return await interaction.editReply({
          embeds: [sendErrorFeedback(interaction.commandName, 'No emoji detected in `emoji`.')],
        });
      }

      const emoji = await interaction.guild.emojis.fetch(verifiedEmoji[3]);
      const editedEmoji = await emoji.edit({ roles: [role] });

      const embed = new EmbedBuilder()
        .setTitle(`Restricted ${editedEmoji} to role @${role.name}!`)

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      const errMsg = error.message;

      if (errMsg.includes('Unknown Emoji')) {
        await interaction.editReply({
          embeds: [sendErrorFeedback(interaction.commandName, 'Emoji is not from this server or does not exist.')],
        });
      } else if (errMsg.includes('Missing Permissions')) {
        await interaction.editReply({
          embeds: [sendErrorFeedback(interaction.commandName, 'Bot is missing `Manage Emojis and Stickers` permission.')],
        });
      } else {
        console.error(`Command:\n${interaction.commandName}\nError:\n${error.stack}\nRaw Input:\n${interaction.options.getString('emoji')}\n${interaction.options.getRole('role')}`);
        await interaction.editReply({
          embeds: [sendErrorFeedback(interaction.commandName)],
        });
      }
    }
  },
};
