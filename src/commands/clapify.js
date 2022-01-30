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

		try {
			return await interaction.reply({ content: `${text} 👏` });
		}
		catch (error) {
			switch (error.message) {
			case 'Invalid Form Body\ndata.content: Must be 2000 or fewer in length.':
				await interaction.reply({ embeds: [sendErrorFeedback(interaction.commandName, '`text` must be less than 2000 characters.')] });
				break;
			default:
				console.error(error);
				return await interaction.reply({ embeds: [sendErrorFeedback(interaction.commandName)] });
			}
		}
	},
};
