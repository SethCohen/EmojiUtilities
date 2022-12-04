import axios from 'axios';
import { findBestMatch } from 'string-similarity';
import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import { getSetting } from '../helpers/dbModel.js';
import { sendErrorFeedback, confirmationButtons } from '../helpers/utilities.js';

export default {
	data: new SlashCommandBuilder()
		.setName('search')
		.setDescription('Searches for an emoji from emoji.gg')
		.addStringOption(option =>
			option.setName('name')
				.setDescription('Name of an emoji to search for.')
				.setRequired(true))
		.addIntegerOption(option =>
			option.setName('category')
				.setDescription('The category to search in for the emoji.')
				.addChoices(
					{ name: 'Original Style', value: 1 },
					{ name: 'TV / Movie', value: 2 },
					{ name: 'Meme', value: 3 },
					{ name: 'Anime', value: 4 },
					{ name: 'Celebrity', value: 5 },
					{ name: 'Blobs', value: 6 },
					{ name: 'Thinking', value: 7 },
					{ name: 'Animated', value: 8 },
					{ name: 'NSFW', value: 9 },
					{ name: 'Gaming', value: 10 },
					{ name: 'Letters', value: 11 },
					{ name: 'Other', value: 12 },
					{ name: 'Pepe', value: 13 },
					{ name: 'Logos', value: 14 },
					{ name: 'Cute', value: 15 },
					{ name: 'Utility', value: 16 },
					{ name: 'Animals', value: 17 },
					{ name: 'Recolors', value: 18 },
					{ name: 'Flags', value: 19 },
					{ name: 'Hearts', value: 20 },
				))
		.addBooleanOption(option =>
			option.setName('includensfw')
				.setDescription('Includes NSFW results. Default: False')),
	async execute(interactionCommand) {
		await interactionCommand.deferReply();

		const response = await axios.get('https://emoji.gg/api');

		const name = interactionCommand.options.getString('name');
		const nsfw = interactionCommand.options.getBoolean('includensfw') ? interactionCommand.options.getBoolean('includensfw') : false;
		const category = interactionCommand.options.getInteger('category');

		let data;
		if (nsfw) {	// Checks if user is searching for nsfw emojis
			if (!interactionCommand.channel.nsfw) {
				return interactionCommand.editReply({ content: 'Sorry, but NSFW content is only allowed NSFW channels.' });
			}
			else if (await getSetting(interactionCommand.guildId, 'allownsfw')) {	// Checks server flag for if searching for nsfw emojis are allowed
				await interactionCommand.editReply({
					content: 'Including NSFW results, eh? Kinky.',
				});

				data = category ? response.data.filter(json => {
					return json.category === category;
				}) : response.data;
			}
			else {
				return await interactionCommand.editReply({ content: 'Sorry, but searching for NSFW is disabled in this server.' });
			}
		}
		else {
			if (category === 9) {	// Checks if user tried searching for NSFW category without setting the `includensfw` flag
				return await interactionCommand.editReply({
					content: 'Sorry, but searching through the NSFW category requires **includensfw: True**.',
				});
			}

			data = category ? response.data.filter(json => {
				return json.category === category;
			}) : response.data.filter(json => {
				return json.category !== 9;
			});
		}

		// Searches for best match
		const match = findBestMatch(name, data.map(json => {
			return json.title;
		}));

		const embed = new EmbedBuilder()
			.setTitle(data[match.bestMatchIndex].title)
			.setDescription(`This emoji had the highest percent likeness to your search parameters at ${(match.bestMatch.rating * 100).toFixed(2)}%\nWould you like to upload it to the server?`)
			.setImage(data[match.bestMatchIndex].image);

		await interactionCommand.editReply({ embeds: [embed], components: [confirmationButtons(true)] });

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
					if (!interactionButton.memberPermissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
						interactionCommand.editReply({ content: 'Cancelling emoji adding. Interaction author lacks permissions.' });
						return await interactionButton.followUp({
							content: 'You do not have enough permissions to use this command.\nRequires **Manage Emojis**.',
							ephemeral: true,
						});
					}

					interactionCommand.guild.emojis
						.create({
							attachment: data[match.bestMatchIndex].image,
							name: data[match.bestMatchIndex].title,
						})
						.then(async emoji => {
							return await interactionCommand.editReply({ content: `Added ${emoji} to server!` });
						})
						.catch(error => {
							switch (error.message) {
							case 'Maximum number of emojis reached (50)':
								interactionCommand.followUp({ embeds: [sendErrorFeedback(interactionCommand.commandName, 'No emoji slots available in server.')] });
								break;
							case 'Invalid Form Body\nimage: File cannot be larger than 256.0 kb.':
								interactionCommand.followUp({ embeds: [sendErrorFeedback(interactionCommand.commandName, 'Image filesize is too big. Cannot add to server, sorry.')] });
								break;
							default:
								console.error(`Command:\n${interactionCommand.commandName}\nError Message:\n${error.message}\nRaw Input:\n${interactionCommand.options.getString('name')}\n${interactionCommand.options.getInteger('category')}\n${interactionCommand.options.getBoolean('includensfw')}`);
								return interactionCommand.followUp({ embeds: [sendErrorFeedback(interactionCommand.commandName)] });
							}

						});
				}
				else if (interactionButton.customId === 'cancel') {
					return await interactionCommand.editReply({ content: 'Canceled.' });
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
				return await interactionCommand.editReply({
					components: [confirmationButtons(false)],
				});
			});
	},
};
