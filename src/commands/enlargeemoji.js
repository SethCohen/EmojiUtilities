const { sendErrorFeedback, verifyEmojiString } = require('../helpers/utilities');
const { SlashCommandBuilder } = require('discord.js');

const getEmojiUrl = (emoji) => {
	if (emoji[1]) {
		return `https://cdn.discordapp.com/emojis/${emoji[3]}.gif`;
	}
	else {
		return `https://cdn.discordapp.com/emojis/${emoji[3]}.png`;
	}
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('enlargeemoji')
		.setDescription('Pastes a custom emoji\'s url to chat.')
		.addStringOption(option =>
			option.setName('emoji')
				.setDescription('The emoji to display.')
				.setRequired(true),
		),
	async execute(interaction) {
		await interaction.deferReply();

		const stringEmoji = interaction.options.getString('emoji');
		const verifiedEmoji = verifyEmojiString(stringEmoji);

		try {
			const url = getEmojiUrl(verifiedEmoji);

			return interaction.editReply({ content: `${url}` });
		}
		catch (error) {
			switch (error.message) {
			case 'Cannot read properties of null (reading \'1\')':
				await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'No emoji found in `emoji`.')] });
				break;
			default:
				console.error(`Command:\n${interaction.commandName}\nError Message:\n${error.message}\nRaw Input:\n${interaction.options.getString('emoji')}`);
				return await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName)] });
			}
		}
	},
};
