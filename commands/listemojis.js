const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('listemojis')
		.setDescription('Displays all usable emotes to chat.'),
	async execute(interaction) {
		return interaction.reply('list emojis WIP...');
	},
};
