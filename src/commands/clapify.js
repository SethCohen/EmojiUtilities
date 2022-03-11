const { SlashCommandBuilder } = require('@discordjs/builders');
const { sendErrorFeedback } = require('../helpers/utilities');

const clapifyText = (text) => {
	return `${text.replace(/ /g, ' 👏 ')} 👏`;
};

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
		const text = interaction.options.getString('text');

		try {
			return await interaction.reply({ content: clapifyText(text) });
		}
		catch (error) {
			switch (error.message) {
			case 'Invalid Form Body\ndata.content: Must be 2000 or fewer in length.':
				await interaction.reply({ embeds: [sendErrorFeedback(interaction.commandName, '`text` must be less than 2000 characters.')] });
				break;
			default:
				console.error(`Command:\n${interaction.commandName}\nError Message:\n${error.message}\nRaw Input:\n${interaction.options.getString('text')}`);
				return await interaction.reply({ embeds: [sendErrorFeedback(interaction.commandName)] });
			}
		}
	},
};
