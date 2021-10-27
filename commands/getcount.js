const { getGetCount } = require('../db_model');
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('getcount')
		.setDescription('Displays the total emote usage to chat.')
		.addUserOption(option =>
			option.setName('user').setDescription('The user to get total emote usage stats for.')),
	async execute(interaction) {
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

		const alltimeCount = getGetCount(interaction.guild.id, user ? user.id : user, '0').toString();
		const yearlyCount = getGetCount(interaction.guild.id, user ? user.id : user, yearly.toISOString()).toString();
		const monthlyCount = getGetCount(interaction.guild.id, user ? user.id : user, monthly.toISOString()).toString();
		const weeklyCount = getGetCount(interaction.guild.id, user ? user.id : user, weekly.toISOString()).toString();
		const dailyCount = getGetCount(interaction.guild.id, user ? user.id : user, daily.toISOString()).toString();
		const hourlyCount = getGetCount(interaction.guild.id, user ? user.id : user, daily.toISOString()).toString();

		const embed = new MessageEmbed()
			.setColor('ORANGE')
			.setTitle(`${user ? user.username : 'Server'}'s Total Count Statistics`)
			.addFields(
				{ name: 'All-Time', value: alltimeCount, inline: true },
				{ name: 'Yearly', value: yearlyCount, inline: true },
				{ name: 'Monthly', value: monthlyCount, inline: true },
				{ name: 'Weekly', value: weeklyCount, inline: true },
				{ name: 'Daily', value: dailyCount, inline: true },
				{ name: 'Hourly', value: hourlyCount, inline: true },
			)
			.setThumbnail(`${user ? user.displayAvatarURL() : interaction.guild.iconURL()}`);
		return interaction.reply({ embeds: [embed] });
	},
};
