const { SlashCommandBuilder } = require('@discordjs/builders');
const { guildId } = require('../../config.json');
const { sendErrorFeedback } = require('../helpers/utilities');

const dancifyText = async (text, interaction) => {
	const guild = await interaction.client.guilds.fetch(guildId);

	let result = '';
	for (const char of text) {
		if ((/[a-zA-Z0-9]/).test(char)) {
			const foundEmoji = await guild.emojis.cache
				.find(emoji => emoji.name === (char.toLowerCase() + '_'));	// Get dancing letter emojis from EmojiUtilities support server

			if (foundEmoji) {
				result += foundEmoji.toString();
			}
		}
		else if (char === ' ') {
			result += '    ';
		}
	}
	return result;
};

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
		await interaction.deferReply();

		const text = interaction.options.getString('text')
			.replace(/[^a-zA-Z0-9 ]/g, '') // Removes any non-alphanumerical characters.
			.replace(/  +/g, ' '); 			// Removes trailing spaces

		try {
			return await interaction.editReply({ content: await dancifyText(text, interaction) });
		}
		catch (error) {
			switch (error.message) {
			case 'Invalid Form Body\ndata.content: Must be 2000 or fewer in length.':
				await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, '`text` must be less than 80 characters.\nIf you\'re wondering why so low, visit the support server and check the FAQ section in #important-info')] });
				break;
			case 'Message content must be a non-empty string.':
				await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, '`text` must contain at least one or more alphanumerical character.\nSpecial characters and unicodes inputs are ignored.')] });
				break;
			default:
				console.error(`Command:\n${interaction.commandName}\nError Message:\n${error.message}\nRaw Input:\n${interaction.options.getString('text')}`);
				return await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName)] });
			}

		}
	},
};
