const { getLeaderboard } = require('../db_model');
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Displays the top ten users for a specified emote\'s usage')
		.addStringOption(option =>
			option.setName('type')
				.setDescription('The type of leaderboard to display.')
				.setRequired(true)
				.addChoices([
					['Sent', 'sent'],
					['Received', 'received'],
				]))
		.addStringOption(option =>
			option.setName('emoji')
				.setDescription('The emoji to get the leaderboard for.')
				.setRequired(true))
		.addIntegerOption(option =>
			option.setName('daterange')
				.setDescription('The date range to query for.')
				.addChoices([
					['All Time', 0],
					['Yearly', 365],
					['Monthly', 30],
					['Weekly', 7],
					['Daily', 1],
					['Hourly', 60],
				])),
	async execute(interaction) {
		const embed = new MessageEmbed().setColor('ORANGE');

		// Validate choices.
		let dateRange = interaction.options.getInteger('daterange');
		switch (dateRange) {
		case 0:
			// all time
			embed.setDescription('All-Time');
			dateRange = '0';
			break;
		case 365:
			// yearly
			embed.setDescription('Yearly');
			dateRange = new Date();
			dateRange.setDate(dateRange.getDate() - 365);
			dateRange = dateRange.toISOString();
			break;
		case 30:
			// monthly
			embed.setDescription('Monthly');
			dateRange = new Date();
			dateRange.setMonth(dateRange.getMonth() - 1);
			dateRange = dateRange.toISOString();
			break;
		case 7:
			// weekly
			embed.setDescription('Weekly');
			dateRange = new Date();
			dateRange.setDate(dateRange.getDate() - 7);
			dateRange = dateRange.toISOString();
			break;
		case 1:
			// daily
			embed.setDescription('Daily');
			dateRange = new Date();
			dateRange.setDate(dateRange.getDate() - 1);
			dateRange = dateRange.toISOString();
			break;
		case 60:
			// daily
			embed.setDescription('Hourly');
			dateRange = new Date();
			dateRange.setHours(dateRange.getHours() - 1);
			dateRange = dateRange.toISOString();
			break;
		default:
			embed.setDescription('All-Time');
			dateRange = null;
		}

		// Validates emoji option.
		const stringEmoji = interaction.options.getString('emoji');
		const re = /(?<=:)\d*(?=>)/g;
		const emojiIds = stringEmoji.match(re);
		let emoji = null;
		try {
			emoji = await interaction.guild.emojis.fetch(emojiIds[0]);
		}
		catch {
			return interaction.reply({ content: 'No emoji found in string.', ephemeral: true });
		}

		// Grabs leaderboard info.
		const type = interaction.options.getString('type');
		const array = (dateRange ?
			getLeaderboard(interaction.guild.id, emoji.id, interaction.client.id, type, dateRange) :
			getLeaderboard(interaction.guild.id, emoji.id, interaction.client.id, type));

		// Catch for empty leaderboard.
		if (!array.length) {
			return interaction.reply({ content: 'Sorry, there\'s no info to display!' });
		}

		// Fills embed.
		embed.setTitle(`${emoji.name} Leaderboard`).setThumbnail(`${emoji.url}`);
		let pos = 1;
		for await (const row of array) {
			const count = Object.values(row)[1];
			const userId = Object.values(row)[0];
			try {
				const user = await interaction.guild.members.fetch(userId);
				embed.addField(`${pos}. ${user.displayName}`, `${count}`);
			}
			catch (e) {
				console.error(e);
			}
			pos++;
		}
		return interaction.reply({ embeds: [embed] });
	},
};
