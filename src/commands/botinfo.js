import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import ms from 'ms';
import { sendErrorFeedback } from '../helpers/utilities.js';
import { mediaLinks } from '../helpers/constants.js';

const getAllGuildsEmojiCount = async (interaction) => {
  const emojiRecordsCollection = interaction.client.db.collection('emoji_records');
  return await emojiRecordsCollection.countDocuments();
};

const buildBotInfoEmbed = (client, emojiUsageCount) => {
  return new EmbedBuilder()
    .setTitle(client.user.username)
    .setDescription(mediaLinks)
    .setThumbnail(client.user.avatarURL() || client.user.defaultAvatarURL)
    .addFields(
      { name: 'Guilds In:', value: client.guilds.cache.size.toString(), inline: true },
      { name: 'Current Uptime:', value: ms(client.uptime), inline: true },
      { name: 'Bot Created:', value: client.user.createdAt.toDateString(), inline: true },
      { name: 'Emoji Usages Recorded:', value: emojiUsageCount.toString(), inline: true }
    );
};

export default {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Displays info about the bot.'),
    
  async execute(interaction) {
    await interaction.deferReply();
    
    try {
      const emojiUsageCount = await getAllGuildsEmojiCount(interaction);
      const embed = buildBotInfoEmbed(interaction.client, emojiUsageCount);
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(`Command:\n${interaction.commandName}\nError:\n${error.stack}`);
      await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName)] });
    }
  },
};
