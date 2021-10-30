const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageActionRow, MessageButton } = require('discord.js');
const { resetDb } = require('../helpers/dbModel');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('resetdb')
		.setDescription('Clears your server\'s databases.')
		.setDefaultPermission(false),
	async execute(interaction) {
		if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
			return interaction.reply({
				content: 'You do not have enough permissions to use this command.',
				ephemeral: true,
			});
		}

		await interaction.deferReply({ ephemeral: true });

		const enabledRow = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('confirm')
					.setLabel('✔ Yes')
					.setStyle('SUCCESS'),
				new MessageButton()
					.setCustomId('cancel')
					.setLabel('❌ No')
					.setStyle('DANGER'),
			);
		const disabledRow = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('confirm')
					.setLabel('✔ Yes')
					.setStyle('SUCCESS')
					.setDisabled(true),
				new MessageButton()
					.setCustomId('cancel')
					.setLabel('❌ No')
					.setStyle('DANGER')
					.setDisabled(true),
			);

		await interaction.editReply({
			content: 'Are you sure you want to reset your server\'s database?\nThis is a permanent decision. There is no undoing this action.',
			components: [enabledRow],
		});

		const message = await interaction.fetchReply();
		const collector = message.createMessageComponentCollector({ time: 30000 });

		// console.log(embeds.length, "length")

		collector.on('collect', async i => {
			if (i.customId === 'confirm') {
				await i.update({ components: [disabledRow] });
				await i.followUp({ content: 'Database reset!', ephemeral: true });
				resetDb(interaction.guild.id);
			}
			else if (i.customId === 'cancel') {
				await i.update({ components: [disabledRow] });
				await i.followUp({ content: 'Canceled reset.', ephemeral: true });
			}
		});

		// eslint-disable-next-line no-unused-vars
		collector.on('end', collected => {
			interaction.editReply({ components: [disabledRow] });
			// console.log(`Collected ${collected.size} interactions.`);
		});

	},
};
