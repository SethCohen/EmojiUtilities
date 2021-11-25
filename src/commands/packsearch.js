const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { findBestMatch } = require('string-similarity');
const { MessageActionRow, MessageButton, MessageEmbed, Permissions } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('packsearch')
		.setDescription('Searches for an emoji pack from emoji.gg')
		.addStringOption(option =>
			option.setName('name')
				.setDescription('Name of the pack to search for.')
				.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply();

		const apiResponse = await axios.get('https://emoji.gg/api/packs');
		const name = interaction.options.getString('name');
		const data = apiResponse.data;

		// Searches for best match
		const match = findBestMatch(name, data.map(json => {
			return json.name;
		}));

		const slug = data[match.bestMatchIndex].slug;
		const packResponse = await axios.get(`https://emoji.gg/pack/${slug}&type=json`);
		// console.log(match);
		// console.log(data[match.bestMatchIndex]);

		let index = 0;
		let pageNumber = 1;
		const embeds = [];
		for (const emoji of packResponse.data.emotes) {
			const embed = new MessageEmbed()
				.setTitle(packResponse.data.name)
				.setDescription(emoji.name)
				.setImage(emoji.url)
				.setFooter(`Page ${pageNumber++}/${packResponse.data.emotes.length}`);
			embeds.push(embed);
		}

		// Creates buttons
		const pageButtons = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('prev')
					.setLabel('👈 Prev')
					.setStyle('SECONDARY'),
				new MessageButton()
					.setCustomId('next')
					.setLabel('👉 Next')
					.setStyle('SECONDARY'),
			);

		const actionButtons = new MessageActionRow()
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

		const pageButtonsDisabled = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('prev')
					.setLabel('👈 Prev')
					.setStyle('SECONDARY')
					.setDisabled(true),
				new MessageButton()
					.setCustomId('next')
					.setLabel('👉 Next')
					.setStyle('SECONDARY')
					.setDisabled(true),
			);

		const actionButtonsDisabled = new MessageActionRow()
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
			)
		;

		await interaction.editReply({
			content: `This pack had the highest percent likeness to your search parameters at ${(match.bestMatch.rating * 100).toFixed(2)}%`,
			embeds: [embeds[index]],
			components: [pageButtons, actionButtons],
		});

		// Adds button listeners
		const message = await interaction.fetchReply();
		const collector = message.createMessageComponentCollector({ time: 120000 });
		collector.on('collect', async i => {
			if (i.customId === 'upload' && i.user === interaction.user) {
				await i.update({ embeds: [embeds[index]], components: [pageButtons, actionButtonsDisabled] });

				if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)) {
					return interaction.editReply({
						content: 'You do not have enough permissions to use this command.\nYou need Manage Emojis perms to use this command.',
						ephemeral: true,
					});
				}

				interaction.guild.emojis
					.create(packResponse.data.emotes[index].url, packResponse.data.emotes[index].name.replace(/-/g, ''))
					.then(emoji => {
						return interaction.editReply({ content: `Added ${emoji} to server!` });
					})
					.catch(e => {
						return interaction.editReply({ content: `Emoji creation failed!\n${e.message}, ${packResponse.data.emotes[index].url}, ${packResponse.data.emotes[index].name}` });
					});
			}
			else if (i.customId === 'cancel' && i.user === interaction.user) {
				await i.update({
					embeds: [embeds[index]],
					components: [pageButtonsDisabled, actionButtonsDisabled],
				});
				return interaction.editReply({ content: 'Canceled.' });
			}
			else if (i.customId === 'prev' && i.user === interaction.user && index > 0) {
				--index;
				await i.update({ embeds: [embeds[index]], components: [pageButtons, actionButtons] });
			}
			else if (i.customId === 'next' && i.user === interaction.user && index < embeds.length - 1) {
				++index;
				await i.update({ embeds: [embeds[index]], components: [pageButtons, actionButtons] });
			}
			else if (i.user !== interaction.user) {
				await i.reply({ content: 'You are not the command author.', ephemeral: true });
			}
			else {
				await i.reply({ content: 'No valid page to go to.', ephemeral: true });
			}
		});

		// eslint-disable-next-line no-unused-vars
		collector.on('end', collected => {
			interaction.editReply({
				content: 'Command timed out.',
				components: [pageButtonsDisabled, actionButtonsDisabled],
			});
			// console.log(`Collected ${collected.size} interactions.`);
		});
	}
	,
}
;
