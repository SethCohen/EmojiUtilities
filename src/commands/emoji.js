const { getEmojiTotalCount } = require('../helpers/dbModel');
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { mediaLinks } = require('../helpers/utilities');

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
		const re = /(?<=:)\d*(?=>)/g;
		const emojiIds = stringEmoji.match(re);
		let emoji = null;
		try {
			emoji = await interaction.guild.emojis.fetch(emojiIds[0]);
		}
		catch {
			return interaction.reply({ content: 'No emoji found in string.', ephemeral: true });
		}

		// Fetches content
		let author;
		try {
			author = await emoji.fetchAuthor();
		}
		catch (ignoreError) {
			return interaction.reply({ content: '**Error:** Bot requires Manage Emojis perm to access emoji info such as emoji author.' });
		}
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
	},
};
