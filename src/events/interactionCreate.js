module.exports = {
	name: 'interactionCreate',
	execute(interaction) {
		// console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);
		if (!interaction.isCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) return;

		try {
			command.execute(interaction);
		}
		catch (error) {
			console.error(error);
			return interaction.reply({
				content: 'There was an error while executing this command!' +
                    '\nIf you think this is a proper bug, either please join the support server for help or create a github issue describing the problem.' +
                    '\nhttps://discord.gg/XaeERFAVfb' +
                    '\nhttps://github.com/SethCohen/EmojiStatistics/issues', ephemeral: true,
			});
		}
	},
};