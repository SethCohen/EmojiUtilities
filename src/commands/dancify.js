const { SlashCommandBuilder } = require('@discordjs/builders');
const { guildId } = require('../../config.json');
const { sendErrorFeedback } = require('../helpers/utilities');

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
		const text = interaction.options.getString('text')
			.replace(/[^a-zA-Z0-9 ]/g, '') // Removes any non-alphanumerical characters.
			.replace(/  +/g, ' '); 			// Removes trailing spaces

		if (text.length > 500) {
			return interaction.reply({ content: 'Message is too long. Max character limit is 500.', ephemeral: true });
		}

		// Converts input characters into emojis.
		let output = '';
		for (const char of text) {
			if ((/[a-zA-Z0-9]/).test(char)) {
				const foundEmoji = await guild.emojis.cache.find(emoji => emoji.name === (char.toLowerCase() + '_'));
				if (foundEmoji) {
					output += foundEmoji.toString();
				}
			}
			else if (char === ' ') {
				output += '    ';
			}
		}

		if (output === '') {
			return await interaction.reply({
				content: 'Output is empty. This may be caused by invalid inputs such as unicode emojis or purely using non-alphanumerical characters. Please try again.' +
					sendErrorFeedback(),
				ephemeral: true,
			});
		}

		return await interaction.reply({ content: output });
	},
};