const { SlashCommandBuilder } = require('@discordjs/builders');

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

		return interaction.reply({ content: `${text} 👏` });


	},
};
