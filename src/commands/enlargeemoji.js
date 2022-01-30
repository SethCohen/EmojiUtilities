const { SlashCommandBuilder } = require('@discordjs/builders');
const { sendErrorFeedback } = require('../helpers/utilities');

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
		// Validates emoji option.
		const stringEmoji = interaction.options.getString('emoji');
		const re = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/;
		const regexEmoji = stringEmoji.match(re);

		try { // Checks for if emoji is animated or not.
			let url;
			if (regexEmoji[1]) {
				url = `https://cdn.discordapp.com/emojis/${regexEmoji[3]}.gif`;
			}
			else {
				url = `https://cdn.discordapp.com/emojis/${regexEmoji[3]}.png`;
			}

			return interaction.reply({ content: `${url}` });
		}
		catch (error) {
			switch (error.message) {
			case 'Cannot read properties of null (reading \'1\')':
				await interaction.reply({ embeds: [sendErrorFeedback(interaction.commandName, 'No emoji found in `emoji`.')] });
				break;
			default:
				console.error(error);
				return await interaction.reply({ embeds: [sendErrorFeedback(interaction.commandName)] });
			}
		}

	},
};
