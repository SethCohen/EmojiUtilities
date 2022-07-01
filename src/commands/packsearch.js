const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { findBestMatch } = require('string-similarity');
const { MessageActionRow, MessageButton, MessageEmbed, Permissions } = require('discord.js');
const { mediaLinks, sendErrorFeedback } = require('../helpers/utilities');

const navigationButtons = (state) => {
	return new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId('prev')
				.setLabel('👈 Prev')
				.setStyle('SECONDARY')
				.setDisabled(state),
			new MessageButton()
				.setCustomId('next')
				.setLabel('👉 Next')
				.setStyle('SECONDARY')
				.setDisabled(state),
		);
};

const actionButtons = (state) => {
	return new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId('upload')
				.setLabel('Upload To Server')
				.setStyle('SUCCESS')
				.setDisabled(state),
			new MessageButton()
				.setCustomId('cancel')
				.setLabel('Cancel')
				.setStyle('DANGER')
				.setDisabled(state),
		);
};

const createPages = (packResponse) => {
	const pages = [];
	let pageNumber = 1;
	for (const emoji of packResponse.data.emotes) {
		const embed = new MessageEmbed()
			.setTitle(`${packResponse.data.name} Pack`)
			.setDescription(mediaLinks)
			.setImage(emoji.url)
			.setFooter({
				text: `Page ${pageNumber++}/${packResponse.data.emotes.length} | ${emoji.name}`,
			});
		pages.push(embed);
	}
	return pages;
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('packsearch')
		.setDescription('Searches for an emoji pack from emoji.gg')
		.addStringOption(option =>
			option.setName('name')
				.setDescription('Name of the pack to search for.')
				.setRequired(true)),
	async execute(interactionCommand) {
		await interactionCommand.deferReply();

		const apiResponse = await axios.get('https://emoji.gg/api/packs');
		const name = interactionCommand.options.getString('name');
		const data = apiResponse.data;
		const match = findBestMatch(name, data.map(json => {
			return json.name;
		}));

		const slug = data[match.bestMatchIndex].slug;
		const packResponse = await axios.get(`https://emoji.gg/pack/${slug}&type=json`);

		let currentPageIndex = 0;
		const pages = createPages(packResponse);
		await interactionCommand.editReply({
			content: `This pack had the highest percent likeness to your search parameters at ${(match.bestMatch.rating * 100).toFixed(2)}%`,
			embeds: [pages[currentPageIndex]],
			components: [navigationButtons(false), actionButtons(false)],
		});

		// Create button listeners
		const message = await interactionCommand.fetchReply();
		const collector = message.createMessageComponentCollector({ time: 120000 });
		collector.on('collect', async interactionButton => {
			if (interactionButton.member === interactionCommand.member) {
				if (interactionButton.customId === 'upload') {
					await interactionButton.update({
						embeds: [pages[currentPageIndex]],
						components: [navigationButtons(false), actionButtons(true)],
					});

					if (!interactionButton.memberPermissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)) {
						return interactionCommand.editReply({
							content: 'You do not have enough permissions to use this command.\nRequires **Manage Emojis**.',
							ephemeral: true,
						});
					}

					interactionCommand.guild.emojis
						.create(packResponse.data.emotes[currentPageIndex].url, packResponse.data.emotes[currentPageIndex].name.replace(/-/g, ''))
						.then(emoji => {
							return interactionCommand.editReply({ content: `Added ${emoji} to server!` });
						})
						.catch(error => {
							switch (error.message) {
							case 'Maximum number of emojis reached (50)':
								interactionCommand.followUp({ embeds: [sendErrorFeedback(interactionCommand.commandName, 'No emoji slots available in server.')] });
								break;
							case 'Invalid Form Body\nimage: File cannot be larger than 256.0 kb.':
								interactionCommand.followUp({ embeds: [sendErrorFeedback(interactionCommand.commandName, 'For some reason, even though this image is on emoji.gg, it\'s over 256kb and thus cannot be uploaded to the server.')] });
								break;
							default:
								console.error(`Command:\n${interactionCommand.commandName}\nError Message:\n${error.message}\nRaw Input:\n${interactionCommand.options.getString('name')}`);
								return interactionCommand.followUp({ embeds: [sendErrorFeedback(interactionCommand.commandName)] });
							}

						});
				}
				else if (interactionButton.customId === 'cancel') {
					await interactionButton.update({
						embeds: [pages[currentPageIndex]],
						components: [navigationButtons(true), actionButtons(true)],
					});
					return interactionCommand.editReply({ content: 'Canceled.' });
				}
				else if (interactionButton.customId === 'prev' && currentPageIndex > 0) {
					--currentPageIndex;
					await interactionButton.update({
						embeds: [pages[currentPageIndex]],
						components: [navigationButtons(false), actionButtons(false)],
					});
				}
				else if (interactionButton.customId === 'next' && currentPageIndex < pages.length - 1) {
					++currentPageIndex;
					await interactionButton.update({
						embeds: [pages[currentPageIndex]],
						components: [navigationButtons(false), actionButtons(false)],
					});
				}
				else {
					await interactionButton.reply({ content: 'No valid page to go to.', ephemeral: true });
				}
			}
			else {
				await interactionButton.reply({
					content: 'You can\'t interact with this button. You are not the command author.',
					ephemeral: true,
				});
			}
		});
		// eslint-disable-next-line no-unused-vars
		collector.on('end', async collected => {
			try {
				await interactionCommand.editReply({
					content: 'Command timed out.',
					components: [navigationButtons(true), actionButtons(true)],
				});
			}
			catch (error) {
				switch (error.message) {
				case 'Unknown Message':
					// Ignore unknown interactions (Often caused from deleted interactions).
					break;
				default:
					console.error(`Command:\n${interactionCommand.commandName}\nError Message:\n${error.message}`);
				}
			}
			// console.log(`Collected ${collected.size} interactions.`);
		});
	},
};
