import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { sendErrorFeedback } from '../helpers/utilities.js';
import { getGetCount } from '../helpers/mongodbModel.js';
import { mediaLinks } from '../helpers/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('getcount')
    .setDescription('Displays the total emote usage to chat.')
    .addUserOption((option) => option.setName('user').setDescription('The user to get total emote usage stats for.')),
  async execute(interaction) {
    await interaction.deferReply();

    try {
      const user = interaction.options.getUser('user');

      const yearly = new Date();
      yearly.setDate(yearly.getDate() - 365);
      const monthly = new Date();
      monthly.setMonth(monthly.getMonth() - 1);
      const weekly = new Date();
      weekly.setDate(weekly.getDate() - 7);
      const daily = new Date();
      daily.setDate(daily.getDate() - 1);
      const hourly = new Date();
      hourly.setHours(hourly.getHours() - 1);

      const alltimeCount = await getGetCount(interaction.client.db, interaction.guild.id, user ? user.id : user, '0');
      const yearlyCount = await getGetCount(
        interaction.client.db,
        interaction.guild.id,
        user ? user.id : user,
        yearly.toISOString(),
      );
      const monthlyCount = await getGetCount(
        interaction.client.db,
        interaction.guild.id,
        user ? user.id : user,
        monthly.toISOString(),
      );
      const weeklyCount = await getGetCount(
        interaction.client.db,
        interaction.guild.id,
        user ? user.id : user,
        weekly.toISOString(),
      );
      const dailyCount = await getGetCount(
        interaction.client.db,
        interaction.guild.id,
        user ? user.id : user,
        daily.toISOString(),
      );
      const hourlyCount = await getGetCount(
        interaction.client.db,
        interaction.guild.id,
        user ? user.id : user,
        daily.toISOString(),
      );

      const embedSuccess = new EmbedBuilder()
        .setDescription(mediaLinks)
        .setTitle(`${user ? user.username : 'Server'}'s Total Count Statistics`)
        .addFields(
          { name: 'All-Time', value: alltimeCount.toString(), inline: true },
          { name: 'Yearly', value: yearlyCount.toString(), inline: true },
          { name: 'Monthly', value: monthlyCount.toString(), inline: true },
          { name: 'Weekly', value: weeklyCount.toString(), inline: true },
          { name: 'Daily', value: dailyCount.toString(), inline: true },
          { name: 'Hourly', value: hourlyCount.toString(), inline: true },
        )
        .setThumbnail(`${user ? user.displayAvatarURL() : interaction.guild.iconURL()}`);
      return interaction.editReply({ embeds: [embedSuccess] });
    }
    catch (error) {
      switch (error.message) {
        default:
          console.error(
            `Command:\n${interaction.commandName}\nError Message:\n${error.message
            }\nRaw Input:\n${interaction.options.getString('emoji')}`,
          );
          return await interaction.editReply({
            embeds: [sendErrorFeedback(interaction.commandName)],
          });
      }
    }
  },
};
