const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Lists all commands'),
	async execute(interaction) {
		const embed = new MessageEmbed()
			.setColor('ORANGE')
			.setTitle('Help & Commands')
			.setDescription('[Invite To Server]' +
                '(https://discord.com/api/oauth2/authorize?client_id=757326308547100712&permissions=93248&scope=applications.commands%20bot)' +
                '\n[Github]' +
                '(https://github.com/SethCohen/EmojiStatistics)' +
                '\n[Support Server]' +
                '(https://discord.gg/XaeERFAVfb)')
			.addFields(
				{ name: '/displaystats <daterange> <optional:user>', value: 'Displays all emote usages to chat.' },
				{ name: '/getcount <optional:user>', value: 'Displays the total emote usage to chat.' },
				{
					name: '/leaderboard <emoji> <optional:daterange>',
					value: 'Displays the top ten users for a specified emote\'s usage.',
				},
				{ name: '/listemojis', value: 'Displays all usable emotes to chat.' },
				{ name: '/config <subcommand> <flag>', value: 'Sets server-specific bot settings.' },
			);

		return interaction.reply({ embeds: [embed] });
	},
};
