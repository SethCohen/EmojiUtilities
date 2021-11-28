const { SlashCommandBuilder } = require('@discordjs/builders');
const { getDisplayStats } = require('../helpers/dbModel');
const { MessageActionRow, MessageButton, Permissions } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removeunused')
		.setDescription('Removes one or more of the least used emojis')
		.addIntegerOption(option =>
			option.setName('number')
				.setDescription('How many emojis to remove. Default: 1')),
	async execute(interaction) {
		await interaction.deferReply();

		const number = interaction.options.getInteger('number') ? interaction.options.getInteger('number') : 1;
		const occurrences = getDisplayStats(interaction.guild.id, '0');

		// Creates buttons
		const buttonRow = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('remove')
					.setLabel('Confirm Remove')
					.setStyle('SUCCESS'),
				new MessageButton()
					.setCustomId('cancel')
					.setLabel('Cancel')
					.setStyle('DANGER'),
			);

		const disabledRow = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('remove')
					.setLabel('Confirm Remove')
					.setStyle('SUCCESS')
					.setDisabled(true),
				new MessageButton()
					.setCustomId('cancel')
					.setLabel('Cancel')
					.setStyle('DANGER')
					.setDisabled(true),
			);

		// Gets all emojis:count in guild by descending count and splices array to just bottom n rows.
		const toRemove = interaction.guild.emojis.cache.map(emoji => {
			const item = occurrences.find(row => row.emoji === emoji.id);
			return item ? { emoji: emoji.id, count: item['COUNT(emoji)'] } : { emoji: emoji.id, count: 0 };
		}).sort((a, b) => {
			return b.count - a.count;
		}).splice(-number);

		const emojis = [];
		for await (const key of toRemove) {
			const emoji = await interaction.guild.emojis.fetch(key.emoji);
			emojis.push(emoji);
		}

		await interaction.editReply({ content: `Emojis to remove: ${emojis}`, components: [buttonRow] });

		// Adds button listeners
		const message = await interaction.fetchReply();
		const collector = message.createMessageComponentCollector({ time: 30000 });
		collector.on('collect', async i => {
			if (i.member === interaction.member) {
				if (i.customId === 'remove') {
					await i.update({ components: [] });

					if (!i.memberPermissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)) {
						return interaction.editReply({
							content: 'You do not have enough permissions to use this command.\nRequires **Manage Emojis**.',
							ephemeral: true,
						});
					}

					for await (const emoji of emojis) {
						await emoji.delete();
					}
					await interaction.editReply({ content: 'Emojis deleted.' });


				}
				else if (i.customId === 'cancel') {
					await i.update({ components: [disabledRow] });
					await interaction.editReply({ content: `Emojis to remove: ${emojis}.\nCanceled.` });
				}
			}
			else {
				await i.reply({
					content: 'You can\'t interact with this button. You are not the command author.',
					ephemeral: true,
				});
			}
		});

		// eslint-disable-next-line no-unused-vars
		collector.on('end', collected => {
			interaction.editReply({ content: `Emojis to remove: ${emojis}.\nCommand timed out.`, components: [] });
			// console.log(`Collected ${collected.size} interactions.`);
		});
	},
};
