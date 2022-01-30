const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const ms = require('ms');
const { getGetCount } = require('../helpers/dbModel');
const { mediaLinks } = require('../helpers/utilities');

const getAllGuildsEmojiCount = (interaction) => {
	let totalEmojiCount = 0;
	interaction.client.guilds.cache.each(guild => {
		totalEmojiCount += getGetCount(guild.id, null, '0');
	});
	return totalEmojiCount;
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('botinfo')
		.setDescription('Displays info about the bot.'),
	execute(interaction) {
		const guildsCount = interaction.client.guilds.cache.size;
		const uptime = interaction.client.uptime;
		const botCreatedDate = interaction.client.user.createdAt.toDateString();

		const embedSuccess = new MessageEmbed()
			.setTitle(`${interaction.client.user.username}`)
			.setDescription(mediaLinks)
			.setThumbnail(`${interaction.client.user.avatarURL()}`)
			.addFields(
				{ name: 'Guilds In:', value: guildsCount.toString(), inline: true },
				{ name: 'Current Uptime:', value: ms(uptime), inline: true },
				{ name: 'Bot Created:', value: botCreatedDate, inline: true },
				{ name: 'Emoji Usages Recorded:', value: getAllGuildsEmojiCount(interaction).toString(), inline: true },
			);

		return interaction.reply({ embeds: [embedSuccess] });

	},
};
