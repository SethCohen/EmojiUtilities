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

		try {
			return await interaction.reply({ content: output });
		}
		catch (error) {
			switch (error.message) {
			case 'Invalid Form Body\ndata.content: Must be 2000 or fewer in length.':
				await interaction.reply({ embeds: [sendErrorFeedback(interaction.commandName, '`text` must be less than 500 characters.')] });
				break;
			case 'Message content must be a non-empty string.':
				await interaction.reply({ embeds: [sendErrorFeedback(interaction.commandName, '`text` must contain at least one or more alphanumerical character.\nSpecial characters and unicodes inputs are ignored.')] });
				break;
			default:
				console.error(error);
				return await interaction.reply({ embeds: [sendErrorFeedback(interaction.commandName)] });
			}

		}
	},
};
