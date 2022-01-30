const { getEmojiTotalCount } = require('../helpers/dbModel');
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { mediaLinks, sendErrorFeedback } = require('../helpers/utilities');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('emoji')
		.setDescription('Displays generic information about an emoji.')
		.addStringOption(option =>
			option.setName('emoji')
				.setDescription('The emoji to get info for.')
				.setRequired(true)),
	async execute(interaction) {
		// Validates emoji option.
		const stringEmoji = interaction.options.getString('emoji');
		const re = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/;
		const regexEmoji = stringEmoji.match(re);

		try {
			const emoji = await interaction.guild.emojis.fetch(regexEmoji[3]);

			// Fetches content
			const author = await emoji.fetchAuthor();
			const count = getEmojiTotalCount(interaction.guild.id, emoji.id);

			// Fills embed.
			const embed = new MessageEmbed()
				.setTitle(`${emoji.name}`)
				.setDescription(mediaLinks)
				.setThumbnail(`${emoji.url}`)
				.addFields(
					{ name: 'Author:', value: author.toString() },
					{ name: 'Date Added:', value: emoji.createdAt.toString() },
					{ name: 'Total Times Used:', value: count.toString() },
				);

			return interaction.reply({ embeds: [embed] });
		}
		catch (error) {
			switch (error.message) {
			case 'Cannot read properties of null (reading \'3\')':
				await interaction.reply({ embeds: [sendErrorFeedback(interaction.commandName, 'No emoji found in `emoji`.')] });
				break;
			case 'Client must have Manage Emojis and Stickers permission in guild Emoji Utilities Support to see emoji authors.':
				await interaction.reply({ embeds: [sendErrorFeedback(interaction.commandName, 'Bot is missing `Manage Emojis And Stickers` permission.')] });
				break;
			default:
				console.error(error);
				return await interaction.reply({ embeds: [sendErrorFeedback(interaction.commandName)] });
			}
		}
	},
};
