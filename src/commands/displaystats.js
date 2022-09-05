const { getDisplayStats } = require('../helpers/dbModel');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { navigationButtons } = require('../helpers/utilities');

const validateDateRange = (dateRange) => {
	let dateString;

	switch (dateRange) {
	case 0:
		// all time
		dateString = 'All-Time';
		dateRange = '0';
		break;
	case 365:
		// yearly
		dateString = 'Yearly';
		dateRange = new Date();
		dateRange.setDate(dateRange.getDate() - 365);
		dateRange = dateRange.toISOString();
		break;
	case 30:
		// monthly
		dateString = 'Monthly';
		dateRange = new Date();
		dateRange.setMonth(dateRange.getMonth() - 1);
		dateRange = dateRange.toISOString();
		break;
	case 7:
		// weekly
		dateString = 'Weekly';
		dateRange = new Date();
		dateRange.setDate(dateRange.getDate() - 7);
		dateRange = dateRange.toISOString();
		break;
	case 1:
		// daily
		dateString = 'Daily';
		dateRange = new Date();
		dateRange.setDate(dateRange.getDate() - 1);
		dateRange = dateRange.toISOString();
		break;
	case 60:
		// hourly
		dateString = 'Hourly';
		dateRange = new Date();
		dateRange.setHours(dateRange.getHours() - 1);
		dateRange = dateRange.toISOString();
		break;
	default:
		dateString = 'All-Time';
		dateRange = '0';
	}

	return { dateString, dateRange };
};

const getSortedOccurrences = (interaction, data) => {
	return interaction.guild.emojis.cache.map(emoji => {
		const item = data.find(row => row.emoji === emoji.id);
		return item ? { emoji: emoji.id, count: item['COUNT(emoji)'] } : { emoji: emoji.id, count: 0 };
	}).sort((a, b) => {
		return b.count - a.count;
	});
};

const getPages = async (user, date, interaction, occurrences) => {
	// Divide occurrences into chunks
	const chunkSize = 24;
	const chunks = [];
	for (let i = 0, j = occurrences.length; i < j; i += chunkSize) {
		const chunk = occurrences.slice(i, i + chunkSize);
		chunks.push(chunk);
	}

	// Map chunks to an embed page
	const embedPages = [];
	let pageNumber = 1;
	for (const chunk of chunks) {
		const embed = new EmbedBuilder()
			.setTitle(`---------- ${user ? user.username : 'Server'}'s Statistics ----------`)
			.setDescription(date.dateString)
			.setFooter({
				text: `Page ${pageNumber++}/${chunks.length}`,
			});
		for await (const row of chunk) {
			const count = row.count;
			const emojiId = row.emoji;
			try {
				const emoji = await interaction.guild.emojis.fetch(emojiId);
				embed.addFields([{ name: `${emoji}`, value: `${count}`, inline: true }]);
			}
			catch (ignoreError) {
				// Ignore empty rows
			}
		}
		embedPages.push(embed);
	}

	return embedPages;
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('displaystats')
		.setDescription('Displays all emote usages to chat.')
		.addIntegerOption(option =>
			option.setName('daterange')
				.setDescription('The date range to query for.')
				.setRequired(true)
				.addChoices(
					{ name: 'All Time', value: 0 },
					{ name: 'Yearly', value: 365 },
					{ name: 'Monthly', value: 30 },
					{ name: 'Weekly', value: 7 },
					{ name: 'Daily', value: 1 },
					{ name: 'Hourly', value: 60 },
				))
		.addUserOption(option =>
			option.setName('user')
				.setDescription('The user to query for. Not specifying grabs entire server\'s statistics.')),
	async execute(interactionCommand) {
		await interactionCommand.deferReply();

		const dateRange = interactionCommand.options.getInteger('daterange');
		const user = interactionCommand.options.getUser('user');
		const date = validateDateRange(dateRange);
		const data = (user ?
			await getDisplayStats(interactionCommand.guild.id, date.dateRange, user.id) :
			await getDisplayStats(interactionCommand.guild.id, date.dateRange));
		const occurrences = getSortedOccurrences(interactionCommand, data);

		// Display output
		const pages = await getPages(user, date, interactionCommand, occurrences);
		let currentPageIndex = 0;
		if (pages.length) {
			await interactionCommand.editReply({
				embeds: [pages[currentPageIndex]],
				components: [navigationButtons(true)],
			});
		}
		else {
			await interactionCommand.editReply({ content: 'Sorry, there\'s no info to display!' });
		}

		// Get page button pressing
		const message = await interactionCommand.fetchReply();
		const collector = message.createMessageComponentCollector({ time: 30000 });
		collector.on('collect', async interactionButton => {
			if (interactionButton.member === interactionCommand.member) {
				if (interactionButton.customId === 'next' && currentPageIndex < pages.length - 1) {
					++currentPageIndex;
				}
				else if (interactionButton.customId === 'prev' && currentPageIndex > 0) {
					--currentPageIndex;
				}
				else if (currentPageIndex === 0) {
					currentPageIndex = pages.length - 1;
				}
				else if (currentPageIndex === pages.length - 1) {
					currentPageIndex = 0;
				}
				await interactionButton.update({ embeds: [pages[currentPageIndex]] });
			}
			else {
				await interactionButton.reply({
					content: 'You can\'t interact with this button. You are not the command author.',
					ephemeral: true,
				});
			}
		});
		// eslint-disable-next-line no-unused-vars
		collector.on('end', async collected => {
			try {
				await interactionCommand.editReply({ components: [navigationButtons(false)] });
			}
			catch (error) {
				switch (error.message) {
				case 'Unknown Message':
					// Ignore unknown interactions (Often caused from deleted interactions).
					break;
				default:
					console.error(`Command:\n${interactionCommand.commandName}\nError Message:\n${error.message}`);
				}
			}
			// console.log(`Collected ${collected.size} interactions.`);
		});
	},
};
