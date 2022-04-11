const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageActionRow, MessageButton } = require('discord.js');
const { resetDb } = require('../helpers/dbModel');

const actionButtons = (state) => {
	return new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId('confirm')
				.setLabel('✔ Yes')
				.setStyle('SUCCESS')
				.setDisabled(state),
			new MessageButton()
				.setCustomId('cancel')
				.setLabel('❌ No')
				.setStyle('DANGER')
				.setDisabled(state),
		);
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('resetdb')
		.setDescription('Clears your server\'s databases.'),
	async execute(interactionCommand) {
		if (!interactionCommand.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
			return interactionCommand.reply({
				content: 'You do not have enough permissions to use this command.\nRequires **Administrator**.',
				ephemeral: true,
			});
		}

		await interactionCommand.deferReply({ ephemeral: true });

		await interactionCommand.editReply({
			content: 'Are you sure you want to reset your server\'s database?\nThis is a permanent decision. There is no undoing this action.',
			components: [actionButtons(false)],
		});

		// Create button listeners
		const message = await interactionCommand.fetchReply();
		const collector = message.createMessageComponentCollector({ time: 30000 });
		collector.on('collect', async interactionButton => {
			if (interactionButton.customId === 'confirm') {
				await interactionButton.update({ components: [actionButtons(true)] });
				await interactionButton.followUp({ content: 'Database reset!', ephemeral: true });
				resetDb(interactionCommand.guild.id);
			}
			else if (interactionButton.customId === 'cancel') {
				await interactionButton.update({ components: [actionButtons(true)] });
				await interactionButton.followUp({ content: 'Canceled reset.', ephemeral: true });
			}
		});
		// eslint-disable-next-line no-unused-vars
		collector.on('end', collected => {
			interactionCommand.editReply({ components: [actionButtons(true)] });
			// console.log(`Collected ${collected.size} interactions.`);
		});

	},
};
