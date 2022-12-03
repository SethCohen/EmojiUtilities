import axios from 'axios';
import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import { getSetting } from '../helpers/dbModel.js';
import { sendErrorFeedback, confirmationButtons } from '../helpers/utilities.js';

export default {
	data: new SlashCommandBuilder()
		.setName('random')
		.setDescription('Gets a random emoji as an image.')
		.addBooleanOption(option =>
			option.setName('includensfw')
				.setDescription('Includes NSFW results. Default: False')),
	async execute(interactionCommand) {
		await interactionCommand.deferReply();

		const response = await axios.get('https://emoji.gg/api/');
		const nsfw = interactionCommand.options.getBoolean('includensfw') ? interactionCommand.options.getBoolean('includensfw') : false;

		let data;
		if (nsfw) {
			if (!interactionCommand.channel.nsfw) {
				return interactionCommand.editReply({ content: 'Sorry, but NSFW content is only allowed NSFW channels.' });
			}
			else if (getSetting(interactionCommand.guildId, 'allownsfw')) {
				data = response.data;
			}
			else {
				return interactionCommand.editReply({ content: 'Sorry, but searching for NSFW is disabled in this server.' });
			}
		}
		else {
			data = response.data.filter(json => {
				return json.category !== 9;
			});
		}

		const item = data[Math.floor(Math.random() * data.length)];
		const embed = new EmbedBuilder()
			.setTitle(item.title)
			.setDescription('Found a random emoji. Would you like to upload it to the server?')
			.setImage(item.image);

		await interactionCommand.editReply({
			embeds: [embed],
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
					await interactionCommand.editReply({ embeds: [embed] });

					if (!interactionButton.memberPermissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
						interactionCommand.editReply({ content: 'Cancelling emoji adding. Interaction author lacks permissions.' });
						return await interactionButton.followUp({
							content: 'You do not have enough permissions to use this command.\nRequires **Manage Emojis**.',
							ephemeral: true,
						});
					}

					interactionCommand.guild.emojis
						.create({ attachment: item.image, name: item.title })
						.then(emoji => {
							return interactionCommand.editReply({ content: `Added ${emoji} to server!` });
						})
						.catch(error => {
							switch (error.message) {
							case 'Maximum number of emojis reached (50)':
								interactionCommand.followUp({ embeds: [sendErrorFeedback(interactionCommand.commandName, 'No emoji slots available in server.')] });
								break;
							case 'Invalid Form Body\nimage: File cannot be larger than 256.0 kb.':
								interactionCommand.followUp({ embeds: [sendErrorFeedback(interactionCommand.commandName, 'Image filesize is too big. Cannot add to server, sorry.')] });
								break;
							case 'Missing Permissions':
								interactionCommand.followUp({ embeds: [sendErrorFeedback(interactionCommand.commandName, 'Cannot add emoji to server.\nBot is missing Manage Emojis & Stickers permission.')] });
								break;
							default:
								console.error(`Command:\n${interactionCommand.commandName}\nError Message:\n${error.message}\nRaw Input:\n${interactionCommand}`);
								return interactionCommand.followUp({ embeds: [sendErrorFeedback(interactionCommand.commandName)] });
							}

						});
				}
				else if (interactionButton.customId === 'cancel') {
					return await interactionCommand.editReply({
						content: 'Canceled.',
						embeds: [embed],
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
						embeds: [embed],
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
