const { getEmojiTotalCount } = require('../helpers/dbModel');
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { mediaLinks, sendErrorFeedback, verifyEmojiString } = require('../helpers/utilities');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('aboutemoji')
		.setDescription('Displays generic information about an emoji.')
		.addStringOption(option =>
			option.setName('emoji')
				.setDescription('The emoji to get info for.')
				.setRequired(true)),
	async execute(interaction) {
		const stringEmoji = interaction.options.getString('emoji');

		try {
			const verifiedEmoji = verifyEmojiString(stringEmoji);
			const emoji = await interaction.guild.emojis.fetch(verifiedEmoji[3]);
			const author = await emoji.fetchAuthor();
			const count = getEmojiTotalCount(interaction.guild.id, emoji.id);

			const embedSuccess = new MessageEmbed()
				.setTitle(`${emoji.name}`)
				.setDescription(mediaLinks)
				.setThumbnail(`${emoji.url}`)
				.addFields(
					{ name: 'Author:', value: author.toString() },
					{ name: 'Date Added:', value: emoji.createdAt.toString() },
					{ name: 'Total Times Used:', value: count.toString() },
				);

			return interaction.reply({ embeds: [embedSuccess] });
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