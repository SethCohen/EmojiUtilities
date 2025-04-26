import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import { sendErrorFeedback, verifyEmojiString } from '../helpers/utilities.js';
import { mediaLinks } from '../helpers/constants.js';

const getEmojiUrl = (emoji) =>
  `https://cdn.discordapp.com/emojis/${emoji[3]}.${emoji[1] ? 'gif' : 'png'}`;

export default {
  data: new SlashCommandBuilder()
    .setName('emojisteal')
    .setDescription('Steals a custom emoji and uploads it to your server.')
    .addStringOption(option =>
      option.setName('emoji').setDescription('The custom emoji to steal.').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('name').setDescription('Name for the copied emoji')
    ),

  async execute(interaction) {
    await interaction.deferReply();

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
      return interaction.editReply({
        content: 'You do not have enough permissions to use this command.\nRequires **Manage Emojis**.',
        ephemeral: true,
      });
    }

    try {
      const stringEmoji = interaction.options.getString('emoji');
      const nameInput = interaction.options.getString('name');
      const verifiedEmoji = verifyEmojiString(stringEmoji);

      if (!verifiedEmoji) {
        return await interaction.editReply({
          embeds: [sendErrorFeedback(interaction.commandName, 'No emoji found in `emoji`.')],
        });
      }

      const emojiName = nameInput || verifiedEmoji[2];
      if (emojiName.length < 2 || emojiName.length > 32) {
        return await interaction.editReply({
          embeds: [sendErrorFeedback(interaction.commandName, 'Emoji name must be between 2-32 characters.')],
        });
      }

      const url = getEmojiUrl(verifiedEmoji);

      const emoji = await interaction.guild.emojis.create({
        attachment: url,
        name: emojiName,
      });

      const embedSuccess = new EmbedBuilder()
        .setTitle(`Added ${emoji} to server!`)
        .setDescription(`If you've enjoyed this bot so far, please consider voting for it.\nIt helps the bot grow. 🙂\n${mediaLinks}`);

      await interaction.editReply({ embeds: [embedSuccess] });

    } catch (error) {
      const errMsg = error.message;

      if (errMsg.includes('Failed to resize asset')) {
        await interaction.editReply({
          embeds: [sendErrorFeedback(interaction.commandName, "Couldn't resize image below 256KB size limit.")],
        });
      } else if (errMsg.includes('Maximum number of emojis reached')) {
        await interaction.editReply({
          embeds: [sendErrorFeedback(interaction.commandName, 'No emoji slots available in server.')],
        });
      } else if (errMsg.includes('Missing Permissions')) {
        await interaction.editReply({
          embeds: [sendErrorFeedback(interaction.commandName, 'Bot is missing `Manage Emojis And Stickers` permission.')],
        });
      } else if (errMsg.includes('Invalid Form Body') && errMsg.includes('name')) {
        await interaction.editReply({
          embeds: [sendErrorFeedback(interaction.commandName, 'Invalid emoji name. Name must be 2-32 alphanumeric characters.')],
        });
      } else if (errMsg.includes('Invalid Webhook Token')) {
        console.error('Discord API is down.');
      } else {
        console.error(`Command:\n${interaction.commandName}\nError:\n${error.stack}\nRaw Input:\n${interaction.options.getString('emoji')}\n${interaction.options.getString('name')}`);
        await interaction.editReply({
          embeds: [sendErrorFeedback(interaction.commandName)],
        });
      }
    }
  },
};
