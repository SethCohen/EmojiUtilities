import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import ms from 'ms';
import { sendErrorFeedback } from '../helpers/utilities.js';
import { mediaLinks } from '../helpers/constants.js';

const getAllGuildsEmojiCount = async (interaction) => {
  const emojiRecordsCollection = interaction.client.db.collection('emoji_records');
  const totalCount = await emojiRecordsCollection.countDocuments();
  return totalCount;
};

export default {
  data: new SlashCommandBuilder().setName('botinfo').setDescription('Displays info about the bot.'),
  async execute(interaction) {
    await interaction.deferReply();

    try {
      const guildsCount = interaction.client.guilds.cache.size;
      const uptime = interaction.client.uptime;
      const botCreatedDate = interaction.client.user.createdAt.toDateString();

      const results = await getAllGuildsEmojiCount(interaction);

      const embedSuccess = new EmbedBuilder()
        .setTitle(`${interaction.client.user.username}`)
        .setDescription(mediaLinks)
        .setThumbnail(`${interaction.client.user.avatarURL()}`)
        .addFields(
          { name: 'Guilds In:', value: guildsCount.toString(), inline: true },
          { name: 'Current Uptime:', value: ms(uptime), inline: true },
          { name: 'Bot Created:', value: botCreatedDate, inline: true },
          {
            name: 'Emoji Usages Recorded:',
            value: results.toString(),
            inline: true,
          }
        );

      return await interaction.editReply({ embeds: [embedSuccess] });
    } catch (error) {
      switch (error.message) {
        default:
          console.error(`Command:\n${interaction.commandName}\nError Message:\n${error.message}`);
          return await interaction.editReply({
            embeds: [sendErrorFeedback(interaction.commandName)],
          });
      }
    }
  },
};
