const { SlashCommandBuilder } = require('@discordjs/builders');
const { getDisplayStats } = require('../helpers/dbModel');
const { MessageActionRow, MessageButton, Permissions } = require('discord.js');

const actionButtons = (state) => {
	return new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId('remove')
				.setLabel('Confirm Remove')
				.setStyle('SUCCESS')
				.setDisabled(state),
			new MessageButton()
				.setCustomId('cancel')
				.setLabel('Cancel')
				.setStyle('DANGER')
				.setDisabled(state),
		);
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removeunused')
		.setDescription('Removes one or more of the least used emojis')
		.addIntegerOption(option =>
			option.setName('number')
				.setDescription('How many emojis to remove. Default: 1')),
	async execute(interaction) {
		if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)) {
			return interaction.reply({
				content: 'You do not have enough permissions to use this command.\nRequires **Manage Emojis**.',
				ephemeral: true,
			});
		}

		await interaction.deferReply();

		const number = interaction.options.getInteger('number') ? interaction.options.getInteger('number') : 1;
		const occurrences = getDisplayStats(interaction.guild.id, '0');

		// Gets all emojis:count in guild by descending count and splices array to just bottom n rows.
		// Essentially returns the n amount least used emojis in the server.
		const toRemove = interaction.guild.emojis.cache.map(emoji => {
			const item = occurrences.find(row => row.emoji === emoji.id);
			return item ? { emoji: emoji.id, count: item['COUNT(emoji)'] } : { emoji: emoji.id, count: 0 };
		}).sort((a, b) => {
			return b.count - a.count;
		}).splice(-number);

		// Fetches and stores Emoji objects for later removal.
		const emojis = [];
		for await (const key of toRemove) {
			const emoji = await interaction.guild.emojis.fetch(key.emoji);
			emojis.push(emoji);
		}
		await interaction.editReply({ content: `Emojis to remove: ${emojis}`, components: [actionButtons(false)] });

		// Create button listeners
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
					await i.update({ components: [actionButtons(true)] });
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
		collector.on('end', async collected => {
			try {
				await interaction.editReply({
					content: `Emojis to remove: ${emojis}.\nCommand timed out.`,
					components: [],
				});
			}
			catch (error) {
				switch (error.message) {
				case 'Unknown Message':
					// Ignore unknown interactions (Often caused from deleted interactions).
					break;
				default:
					console.error(`Command:\n${interaction.commandName}\nError Message:\n${error.message}`);
				}
			}
			// console.log(`Collected ${collected.size} interactions.`);
		});
	},
};
