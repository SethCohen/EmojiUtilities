const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { findBestMatch } = require('string-similarity');
const { MessageActionRow, MessageButton, MessageEmbed, Permissions } = require('discord.js');
const { getSetting } = require('../helpers/dbModel');
const { sendErrorFeedback } = require('../helpers/utilities');

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

module.exports = {
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
	async execute(interaction) {
		await interaction.deferReply();

		const response = await axios.get('https://emoji.gg/api');

		const name = interaction.options.getString('name');
		const nsfw = interaction.options.getBoolean('includensfw') ? interaction.options.getBoolean('includensfw') : false;
		const category = interaction.options.getInteger('category');

		let data;
		if (nsfw) {	// Checks if user is searching for nsfw emojis
			if (!interaction.channel.nsfw) {
				return interaction.editReply({ content: 'Sorry, but NSFW content is only allowed NSFW channels.' });
			}
			else if (getSetting(interaction.guildId, 'allownsfw')) {	// Checks server flag for if searching for nsfw emojis are allowed
				await interaction.editReply({
					content: 'Including NSFW results, eh? Kinky.',
				});

				data = category ? response.data.filter(json => {
					return json.category === category;
				}) : response.data;
			}
			else {
				return await interaction.editReply({ content: 'Sorry, but searching for NSFW is disabled in this server.' });
			}
		}
		else {
			if (category === 9) {	// Checks if user tried searching for NSFW category without setting the `includensfw` flag
				return await interaction.editReply({
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

		const embed = new MessageEmbed()
			.setTitle(data[match.bestMatchIndex].title)
			.setDescription(`This emoji had the highest percent likeness to your search parameters at ${(match.bestMatch.rating * 100).toFixed(2)}%`)
			.setImage(data[match.bestMatchIndex].image);

		await interaction.editReply({ embeds: [embed], components: [actionButtons(false)] });

		// Create button listeners
		const message = await interaction.fetchReply();
		const collector = message.createMessageComponentCollector({ time: 30000 });
		collector.on('collect', async i => {
			if (i.member === interaction.member) { 	// Checks if buttton interaction user is same as command interaction user
				if (i.customId === 'upload' && i.user === interaction.user) {
					await i.update({ embeds: [embed], components: [actionButtons(true)] });

					if (!i.memberPermissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)) {
						return interaction.editReply({
							content: 'You do not have enough permissions to use this command.\nRequires **Manage Emojis**.',
							ephemeral: true,
						});
					}

					interaction.guild.emojis
						.create(data[match.bestMatchIndex].image, data[match.bestMatchIndex].title)
						.then(emoji => {
							return interaction.editReply({ content: `Added ${emoji} to server!` });
						})
						.catch(error => {
							switch (error.message) {
							case 'Maximum number of emojis reached (50)':
								interaction.followUp({ embeds: [sendErrorFeedback(interaction.commandName, 'No emoji slots available in server.')] });
								break;
							case 'Invalid Form Body\nimage: File cannot be larger than 256.0 kb.':
								interaction.followUp({ embeds: [sendErrorFeedback(interaction.commandName, 'Image filesize is too big. Cannot add to server, sorry.')] });
								break;
							default:
								console.error(`Command:\n${interaction.commandName}\nError Message:\n${error.message}\nRaw Input:\n${interaction.options.getString('name')}\n${interaction.options.getInteger('category')}\n${interaction.options.getBoolean('includensfw')}`);
								return interaction.followUp({ embeds: [sendErrorFeedback(interaction.commandName)] });
							}

						});
				}
				else if (i.customId === 'cancel' && i.user === interaction.user) {
					await i.update({ embeds: [embed], components: [actionButtons(true)] });
					return interaction.editReply({ content: 'Canceled.' });
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
			interaction.editReply({ content: 'Command timed out.', components: [actionButtons(true)] });
			// console.log(`Collected ${collected.size} interactions.`);
		});
	}
	,
}
;
