const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder, hyperlink } = require('@discordjs/builders');
const ms = require('ms');
const { getGetCount } = require('../db_model');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('botinfo')
		.setDescription('Displays info about the bot.'),
	execute(interaction) {
		const guildsCount = interaction.client.guilds.cache.size;
		const uptime = interaction.client.uptime;
		const botCreatedDate = interaction.client.user.createdAt.toDateString();
		let totalEmojiCount = 0;
		interaction.client.guilds.cache.each(guild => {
			totalEmojiCount += getGetCount(guild.id, null, '0');
		});


		const embed = new MessageEmbed().setColor('ORANGE');
		embed.setTitle(`${interaction.client.user.username}`)
			.setThumbnail(`${interaction.client.user.avatarURL()}`)
			.addFields(
				{ name: 'Guilds In:', value: guildsCount.toString(), inline: true },
				{ name: 'Current Uptime:', value: ms(uptime), inline: true },
				{ name: 'Bot Created:', value: botCreatedDate, inline: true },
				{ name: 'Emoji Usages Recorded:', value: totalEmojiCount.toString(), inline: true },
			)
			.setDescription(hyperlink('Vote for Emoji Utilities!', 'https://top.gg/bot/757326308547100712'));
		// TODO add shards count when shards are implemented.

		return interaction.reply({ embeds: [embed] });

	},
};
