const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { MessageEmbed, MessageActionRow, MessageButton, Permissions } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('random')
		.setDescription('Gets a random emoji as an image.'),
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

		const item = response.data[Math.floor(Math.random() * response.data.length)];
		const embed = new MessageEmbed()
			.setTitle(item.title)
			.setImage(item.image);

		await interaction.editReply({ embeds: [embed], components: [buttonRow] });

		// Adds button listeners
		const message = await interaction.fetchReply();
		const collector = message.createMessageComponentCollector({ time: 30000 });
		collector.on('collect', async i => {
			if (i.customId === 'upload' && i.user === interaction.user) {
				await i.update({ embeds: [embed], components: [disabledRow] });

				if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)) {
					return interaction.editReply({
						content: 'You do not have enough permissions to use this command.\nYou need Manage Emojis perms to use this command.',
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
			}
			else {
				await i.reply({ content: 'You are not the command author.', ephemeral: true });
			}
		});

		// eslint-disable-next-line no-unused-vars
		collector.on('end', collected => {
			interaction.editReply({ components: [disabledRow] });
			// console.log(`Collected ${collected.size} interactions.`);
		});
	},
};
