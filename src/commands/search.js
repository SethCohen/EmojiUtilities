const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { findBestMatch } = require('string-similarity');
const { MessageActionRow, MessageButton, MessageEmbed, Permissions } = require('discord.js');
const { getSetting } = require('../helpers/dbModel');

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
				.addChoices([
					['Original Style', 1],
					['TV / Movie', 2],
					['Meme', 3],
					['Anime', 4],
					['Celebrity', 5],
					['Blobs', 6],
					['Thinking', 7],
					['Animated', 8],
					['NSFW', 9],
					['Gaming', 10],
					['Letters', 11],
					['Other', 12],
					['Pepe', 13],
					['Logos', 14],
					['Cute', 15],
					['Utility', 16],
					['Animals', 17],
					['Recolors', 18],
					['Flags', 19],
					['Hearts', 20],
				]))
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
		if (nsfw) {
			if (getSetting(interaction.guildId, 'allownsfw')) {
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
			if (category === 9) {
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

		// console.log(match);
		// console.log(data[match.bestMatchIndex]);

		// Creates buttons
		const buttonRow = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('upload')
					.setLabel('Upload To Server')
					.setStyle('SUCCESS'),
				new MessageButton()
					.setCustomId('cancel')
					.setLabel('Cancel')
					.setStyle('DANGER'),
			);

		const disabledRow = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('upload')
					.setLabel('Upload To Server')
					.setStyle('SUCCESS')
					.setDisabled(true),
				new MessageButton()
					.setCustomId('cancel')
					.setLabel('Cancel')
					.setStyle('DANGER')
					.setDisabled(true),
			);


		const embed = new MessageEmbed()
			.setTitle(data[match.bestMatchIndex].title)
			.setDescription(`This emoji had the highest percent likeness to your search parameters at ${(match.bestMatch.rating * 100).toFixed(2)}%`)
			.setImage(data[match.bestMatchIndex].image);

		await interaction.editReply({ embeds: [embed], components: [buttonRow] });

		// Adds button listeners
		const message = await interaction.fetchReply();
		const collector = message.createMessageComponentCollector({ time: 30000 });
		collector.on('collect', async i => {
			if (i.member === interaction.member) {
				if (i.customId === 'upload' && i.user === interaction.user) {
					await i.update({ embeds: [embed], components: [disabledRow] });

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
						.catch(e => {
							return interaction.editReply({ content: `Emoji creation failed!\n${e.message}` });
						});
				}
				else if (i.customId === 'cancel' && i.user === interaction.user) {
					await i.update({ embeds: [embed], components: [disabledRow] });
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
			interaction.editReply({ content: 'Command timed out.', components: [disabledRow] });
			// console.log(`Collected ${collected.size} interactions.`);
		});
	}
	,
}
;
