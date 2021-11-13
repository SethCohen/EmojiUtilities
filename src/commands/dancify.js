const { SlashCommandBuilder } = require('@discordjs/builders');
const { guildId } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dancify')
		.setDescription('Turns an input into a dancing text.')
		.addStringOption(option =>
			option.setName('text')
				.setDescription('The text to dancify.')
				.setRequired(true),
		),
	async execute(interaction) {
		const guild = await interaction.client.guilds.fetch(guildId);
		const text = interaction.options.getString('text').replace(/^[a-zA-Z0-9 ]/g, '');
		// TODO fix whitespace mutlispacing

		if (text.length > 500) {
			return interaction.reply({ content: 'Message is too long. Max character limit is 500.', ephemeral: true });
		}

		let output = '';

		for (const char of text) {
			if ((/[a-zA-Z0-9]/).test(char)) {
				const foundEmoji = await guild.emojis.cache.find(emoji => emoji.name === (char + '_'));
				output += foundEmoji.toString();
			}
			else if (char === ' ') {
				output += '    ';
			}
		}

		return await interaction.reply({ content: output });
	},
};
