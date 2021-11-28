const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder, hyperlink } = require('@discordjs/builders');
const ms = require('ms');
const { getGetCount } = require('../helpers/dbModel');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('botinfo')
		.setDescription('Displays info about the bot.'),
	execute(interaction) {
		const guildsCount = interaction.client.guilds.cache.size;
		const uptime = interaction.client.uptime;
		const botCreatedDate = interaction.client.user.createdAt.toDateString();

		// Queries all databases for emoji usages
		let totalEmojiCount = 0;
		interaction.client.guilds.cache.each(guild => {
			totalEmojiCount += getGetCount(guild.id, null, '0');
		});

		const embed = new MessageEmbed()
			.setTitle(`${interaction.client.user.username}`)
			.setDescription(hyperlink('Vote for Emoji Utilities!', 'https://top.gg/bot/757326308547100712'))
			.setThumbnail(`${interaction.client.user.avatarURL()}`)
			.addFields(
				{
					name: 'Support Server:',
					value: hyperlink('Emoji Utilities', 'https://discord.gg/XaeERFAVfb'),
					inline: true,
				},
				{
					name: 'Github Repo',
					value: hyperlink('Github', 'https://github.com/SethCohen/EmojiUtilities'),
					inline: true,
				},
				{ name: 'Guilds In:', value: guildsCount.toString(), inline: true },
				{ name: 'Current Uptime:', value: ms(uptime), inline: true },
				{ name: 'Bot Created:', value: botCreatedDate, inline: true },
				{ name: 'Emoji Usages Recorded:', value: totalEmojiCount.toString(), inline: true },
			);
		// TODO add shards count when shards are implemented.

		return interaction.reply({ embeds: [embed] });

	},
};
