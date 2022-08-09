const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { mediaLinks } = require('../helpers/utilities');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Prints a list of useful bot-related resources to chat.'),
	async execute(interaction) {
		await interaction.deferReply();

		const embed = new MessageEmbed()
			.setTitle('Help')
			.setDescription(mediaLinks + ' | [FAQ](https://github.com/SethCohen/EmojiUtilities/wiki#frequently-asked-questions) | [List of Supported Commands](https://github.com/SethCohen/EmojiUtilities/wiki)');

		return interaction.editReply({ embeds: [embed] });
	},
};
