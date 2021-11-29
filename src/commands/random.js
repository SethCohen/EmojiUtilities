const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { MessageEmbed, MessageActionRow, MessageButton, Permissions } = require('discord.js');
const { getSetting } = require('../helpers/dbModel');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('random')
		.setDescription('Gets a random emoji as an image.')
		.addBooleanOption(option =>
			option.setName('includensfw')
				.setDescription('Includes NSFW results. Default: False')),
	async execute(interaction) {
		await interaction.deferReply();

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

		const response = await axios.get('https://emoji.gg/api/');
		const nsfw = interaction.options.getBoolean('includensfw') ? interaction.options.getBoolean('includensfw') : false;

		let data;
		if (nsfw) {
			if (getSetting(interaction.guildId, 'allownsfw')) {
				data = response.data;
			}
			else {
				return interaction.editReply({ content: 'Sorry, but searching for NSFW is disabled in this server.' });
			}
		}
		else {
			data = response.data.filter(json => {
				return json.category !== 9;
			});
		}

		const item = data[Math.floor(Math.random() * data.length)];
		const embed = new MessageEmbed()
			.setTitle(item.title)
			.setImage(item.image);

		await interaction.editReply({ embeds: [embed], components: [buttonRow] });

		// Adds button listeners
		const message = await interaction.fetchReply();
		const collector = message.createMessageComponentCollector({ time: 30000 });
		collector.on('collect', async i => {
			if (i.member === interaction.member) {
				if (i.customId === 'upload') {
					await i.update({ embeds: [embed], components: [disabledRow] });

					if (!i.memberPermissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)) {
						return interaction.editReply({
							content: 'You do not have enough permissions to use this command.\nRequires **Manage Emojis**.',
							ephemeral: true,
						});
					}

					interaction.guild.emojis
						.create(item.image, item.title)
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
	},
};
