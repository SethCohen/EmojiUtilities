import { getLeaderboard } from '../helpers/dbModel.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { sendErrorFeedback, verifyEmojiString } from '../helpers/utilities.js';

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
		// daily
		dateString = 'Hourly';
		dateRange = new Date();
		dateRange.setHours(dateRange.getHours() - 1);
		dateRange = dateRange.toISOString();
		break;
	default:
		dateString = 'All-Time';
		dateRange = null;
	}

	return { dateString, dateRange };

};

const createOutput = async (interaction, emoji, date, array) => {
	const embed = new EmbedBuilder()
		.setTitle(`${emoji.name} Leaderboard`)
		.setDescription(date.dateString)
		.setThumbnail(`${emoji.url}`);
	let leaderboardPos = 1;
	for await (const row of array) {
		const count = Object.values(row)[1];
		const userId = Object.values(row)[0];
		try {
			const user = await interaction.guild.members.fetch(userId);
			embed.addFields([{ name: `${leaderboardPos}. ${user.displayName}`, value: `${count}` }]);
		}
		catch (e) {
			console.error(`createOutput error\n${e}`);
		}
		leaderboardPos++;
	}

	return embed;
};

export default {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Displays the top ten users for a specified emote\'s usage')
		.addStringOption(option =>
			option.setName('type')
				.setDescription('The type of leaderboard to display.')
				.setRequired(true)
				.addChoices(
					{ name: 'Sent', value: 'sent' },
					{ name: 'Received', value: 'received' },
				))
		.addStringOption(option =>
			option.setName('emoji')
				.setDescription('The emoji to get the leaderboard for.')
				.setRequired(true))
		.addIntegerOption(option =>
			option.setName('daterange')
				.setDescription('The date range to query for.')
				.addChoices(
					{ name: 'All Time', value: 0 },
					{ name: 'Yearly', value: 365 },
					{ name: 'Monthly', value: 30 },
					{ name: 'Weekly', value: 7 },
					{ name: 'Daily', value: 1 },
					{ name: 'Hourly', value: 60 },
				)),
	async execute(interaction) {
		await interaction.deferReply();

		const type = interaction.options.getString('type');
		const stringEmoji = interaction.options.getString('emoji');
		const dateRange = interaction.options.getInteger('daterange');

		try {
			const date = validateDateRange(dateRange);

			const verifiedEmoji = verifyEmojiString(stringEmoji);
			const emoji = await interaction.guild.emojis.fetch(verifiedEmoji[3]);

			const data = (date.dateRange ?
				getLeaderboard(interaction.guild.id, emoji.id, interaction.client.id, type, date.dateRange) :
				getLeaderboard(interaction.guild.id, emoji.id, interaction.client.id, type));
			if (!data.length) {
				return await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'Sorry, there\'s no info to display!\nThe leaderboard is empty!')] });
			}

			const embedSuccess = await createOutput(interaction, emoji, date, data);

			return interaction.editReply({ embeds: [embedSuccess] });
		}
		catch (error) {
			switch (error.message) {
			case 'Cannot read properties of null (reading \'3\')':
				await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'No emoji found in `emoji`.')] });
				break;
			case 'Unknown Emoji':
				await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'Emoji found in `emoji` is not from this server.')] });
				break;
			default:
				console.error(`Command:\n${interaction.commandName}\nError Message:\n${error.message}\nRaw Input:\n${interaction.options.getString('type')}\n${interaction.options.getString('emoji')}\n${interaction.options.getInteger('daterange')}`);
				return await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName)] });
			}
		}
	},
};
