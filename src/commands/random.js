const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { MessageEmbed, MessageActionRow, MessageButton, Permissions } = require('discord.js');
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
			if (getSetting(interactionCommand.guildId, 'allownsfw')) {
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
		const embed = new MessageEmbed()
			.setTitle(item.title)
			.setImage(item.image);

		await interactionCommand.editReply({ embeds: [embed], components: [actionButtons(false)] });

		// Create button listeners
		const message = await interactionCommand.fetchReply();
		const collector = message.createMessageComponentCollector({ time: 30000 });
		collector.on('collect', async interactionButton => {
			if (interactionButton.member === interactionCommand.member) {
				if (interactionButton.customId === 'upload') {
					await interactionButton.update({ embeds: [embed], components: [actionButtons(true)] });

					if (!interactionButton.memberPermissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)) {
						return interactionCommand.editReply({
							content: 'You do not have enough permissions to use this command.\nRequires **Manage Emojis**.',
							ephemeral: true,
						});
					}

					interactionCommand.guild.emojis
						.create(item.image, item.title)
						.then(emoji => {
							return interactionCommand.editReply({ content: `Added ${emoji} to server!` });
						})
						.catch(error => {
							switch (error.message) {
							case 'Maximum number of emojis reached (50)':
								interactionCommand.followUp({ embeds: [sendErrorFeedback(interactionCommand.commandName, 'No emoji slots available in server.')] });
								break;
							default:
								console.error(error);
								return interactionCommand.followUp({ embeds: [sendErrorFeedback(interactionCommand.commandName)] });
							}

						});
				}
				else if (interactionButton.customId === 'cancel' && interactionButton.user === interactionCommand.user) {
					await interactionButton.update({ embeds: [embed], components: [actionButtons(true)] });
					return interactionCommand.editReply({ content: 'Canceled.' });
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
		collector.on('end', collected => {
			interactionCommand.editReply({ content: 'Command timed out.', components: [actionButtons(true)] });
			// console.log(`Collected ${collected.size} interactions.`);
		});
	},
};
