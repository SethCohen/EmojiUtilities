import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { sendErrorFeedback } from '../helpers/utilities.js';
import { getGetCount } from '../helpers/mongodbModel.js';
import { mediaLinks } from '../helpers/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('getcount')
    .setDescription('Displays the total emote usage to chat.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to get total emote usage stats for.')
    ),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const user = interaction.options.getUser('user');
      const userId = user?.id;

      const now = new Date();
      const yearly = new Date(now);
      yearly.setDate(yearly.getDate() - 365);
      const monthly = new Date(now);
      monthly.setMonth(monthly.getMonth() - 1);
      const weekly = new Date(now);
      weekly.setDate(weekly.getDate() - 7);
      const daily = new Date(now);
      daily.setDate(daily.getDate() - 1);
      const hourly = new Date(now);
      hourly.setHours(hourly.getHours() - 1);

      const [alltimeCount, yearlyCount, monthlyCount, weeklyCount, dailyCount, hourlyCount] = await Promise.all([
        getGetCount(interaction.client.db, interaction.guild.id, userId, '0'),
        getGetCount(interaction.client.db, interaction.guild.id, userId, yearly.toISOString()),
        getGetCount(interaction.client.db, interaction.guild.id, userId, monthly.toISOString()),
        getGetCount(interaction.client.db, interaction.guild.id, userId, weekly.toISOString()),
        getGetCount(interaction.client.db, interaction.guild.id, userId, daily.toISOString()),
        getGetCount(interaction.client.db, interaction.guild.id, userId, hourly.toISOString())
      ]);

      const embed = new EmbedBuilder()
        .setTitle(`${user ? user.username : 'Server'}'s Total Count Statistics`)
        .setDescription(mediaLinks)
        .addFields(
          { name: 'All-Time', value: alltimeCount.toString(), inline: true },
          { name: 'Yearly', value: yearlyCount.toString(), inline: true },
          { name: 'Monthly', value: monthlyCount.toString(), inline: true },
          { name: 'Weekly', value: weeklyCount.toString(), inline: true },
          { name: 'Daily', value: dailyCount.toString(), inline: true },
          { name: 'Hourly', value: hourlyCount.toString(), inline: true }
        )
        .setThumbnail(user?.displayAvatarURL() || interaction.guild.iconURL());

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error(`Command:\n${interaction.commandName}\nError:\n${error.stack}`);
      await interaction.editReply({
        embeds: [sendErrorFeedback(interaction.commandName)],
      });
    }
  },
};
