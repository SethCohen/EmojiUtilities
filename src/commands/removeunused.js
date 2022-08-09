const { SlashCommandBuilder } = require('@discordjs/builders');
const { getDisplayStats } = require('../helpers/dbModel');
const { Permissions } = require('discord.js');
const { confirmationButtons } = require('../helpers/utilities');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removeunused')
		.setDescription('Removes one or more of the least used emojis')
		.addIntegerOption(option =>
			option.setName('number')
				.setDescription('How many emojis to remove. Default: 1')),
	async execute(interactionCommand) {
		await interactionCommand.deferReply();

		if (!interactionCommand.member.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)) {
			return interactionCommand.reply({
				content: 'You do not have enough permissions to use this command.\nRequires **Manage Emojis**.',
				ephemeral: true,
			});
		}


		const number = interactionCommand.options.getInteger('number') ? interactionCommand.options.getInteger('number') : 1;
		const occurrences = getDisplayStats(interactionCommand.guild.id, '0');

		// Gets all emojis:count in guild by descending count and splices array to just bottom n rows.
		// Essentially returns the n amount least used emojis in the server.
		const toRemove = interactionCommand.guild.emojis.cache.map(emoji => {
			const item = occurrences.find(row => row.emoji === emoji.id);
			return item ? { emoji: emoji.id, count: item['COUNT(emoji)'] } : { emoji: emoji.id, count: 0 };
		}).sort((a, b) => {
			return b.count - a.count;
		}).splice(-number);

		// Fetches and stores Emoji objects for later removal.
		const emojis = [];
		for await (const key of toRemove) {
			const emoji = await interactionCommand.guild.emojis.fetch(key.emoji);
			emojis.push(emoji);
		}
		await interactionCommand.editReply({
			content: `Emojis to remove: ${emojis}`,
			components: [confirmationButtons(true)],
		});

		// Create button listeners
		const message = await interactionCommand.fetchReply();
		const filter = async i => {
			await i.deferUpdate();
			if (i.user.id !== interactionCommand.user.id) {
				await i.followUp({
					content: 'You can\'t interact with this button. You are not the command author.',
					ephemeral: true,
				});
			}
			return i.user.id === interactionCommand.user.id;
		};
		message.awaitMessageComponent({ filter, time: 30000 })
			.then(async interactionButton => {
				if (interactionButton.customId === 'confirm') {
					if (!interactionButton.memberPermissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)) {
						interactionCommand.editReply({ content: 'Cancelling emoji adding. Interaction author lacks permissions.' });
						return await interactionButton.followUp({
							content: 'You do not have enough permissions to use this command.\nRequires **Manage Emojis**.',
							ephemeral: true,
						});
					}

					for await (const emoji of emojis) {
						await emoji.delete();
					}
					return await interactionCommand.editReply({
						content: 'Emojis deleted.',
					});
				}
				else if (interactionButton.customId === 'cancel') {
					return await interactionButton.editReply({
						content: `Emojis to remove: ${emojis}.\nCanceled.`,
					});
				}
			})
			.catch(async error => {
				switch (error.message) {
				case 'Unknown Message':
					// Ignore unknown interactions (Often caused from deleted interactions).
					break;
				case 'Collector received no interactions before ending with reason: time':
					await interactionCommand.editReply({
						content: 'User took too long. Interaction timed out.',
					});
					break;
				default:
					console.error(`Command:\n${interactionCommand.commandName}\nError Message:\n${error.message}`);
				}
			})
			.finally(async () => {
				await interactionCommand.editReply({
					components: [confirmationButtons(false)],
				});
			});
	},
};
