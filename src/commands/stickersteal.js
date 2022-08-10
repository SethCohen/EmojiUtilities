const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { sendErrorFeedback } = require('../helpers/utilities');
const converter = require('discord-emoji-converter');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stickersteal')
		.setDescription('Steals a sticker by message id and uploads it to your server.')
		.addStringOption(option =>
			option.setName('messageid')
				.setDescription('The message id that contains the sticker. Requires Developer Mode enable in Discord Settings to get.')
				.setRequired(true),
		)
		.addStringOption(option =>
			option.setName('tag')
				.setDescription('The Discord unicode emoji to represent the sticker.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('name')
				.setDescription('The name for the sticker.')),
	async execute(interaction) {
		await interaction.deferReply();

		if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)) {
			return interaction.editReply({
				content: 'You do not have enough permissions to use this command.\nRequires **Manage Emojis**.',
				ephemeral: true,
			});
		}

		const messageId = interaction.options.getString('messageid');
		const stickerName = interaction.options.getString('name');
		let stickerTag = interaction.options.getString('tag');
		let message;
		try {
			message = await interaction.channel.messages.fetch(messageId);
		}
		catch (e) {
			if (e.message === 'Unknown Message') return interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'Message not found. Make sure `messageId` is correct and command is run in same channel as sticker.')] });
			console.error(e);
		}
		const fetchedSticker = message.stickers.first();

		stickerTag = converter.getShortcode(stickerTag, false);		// Convert unicode emoji to discord string name

		interaction.guild.stickers.create(fetchedSticker.url, stickerName ? stickerName : fetchedSticker.name, stickerTag)
			.then(createdSticker => {
				return interaction.editReply({
					content: `Created new sticker with name **${createdSticker.name}**!`,
				});
			})
			.catch(error => {
				switch (error.message) {
				case 'Maximum number of stickers reached (5)':
					interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'No sticker slots available in server.')] });
					break;
				case 'Maximum number of stickers reached (15)':
					interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'No sticker slots available in server.')] });
					break;
				default:
					console.error(`**Command:**\n${interaction.commandName}\n**Error Message:**\n${error.message}\n**Raw Input:**\n${interaction.options.getString('messageid')}\n${interaction.options.getString('name')}\n${interaction.options.getString('tag')}`);
					return interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName)] });
				}
			});


	},
};
