const { SlashCommandBuilder } = require('@discordjs/builders');
const { sendErrorFeedback } = require('../helpers/utilities');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clapify')
		.setDescription('Adds claps between words in a given text.')
		.addStringOption(option =>
			option.setName('text')
				.setDescription('The text to clapify.')
				.setRequired(true),
		),
	async execute(interaction) {
		let text = interaction.options.getString('text');
		text = text.replace(/ /g, ' 👏 ');

		if (text.length > 1998) {
			return interaction.reply({ content: `Input is too long. Please try again. ${sendErrorFeedback()}` });
		}

		return interaction.reply({ content: `${text} 👏` });
	},
};
