const { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const { sendErrorFeedback, mediaLinks } = require('../helpers/utilities');
const imageType = require('image-type');
const sharp = require('sharp');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('uploademoji')
		.setDescription('Uploads a given url as an emoji.')
		.addStringOption(option =>
			option.setName('url')
				.setDescription('The url of the emoji to upload.')
				.setRequired(true),
		)
		.addStringOption(option =>
			option.setName('name')
				.setDescription('Name for the emoji')),
	async execute(interaction) {
		try {
			await interaction.deferReply();

			if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
				return interaction.editReply({
					content: 'You do not have enough permissions to use this command.\nRequires **Manage Emojis**.',
					ephemeral: true,
				});
			}

			const url = interaction.options.getString('url');
			const randGenName = Math.random().toString(36).substring(2, 10);
			const name = interaction.options.getString('name') ? interaction.options.getString('name') : randGenName;

			const dir = './temps';
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir);
			}

			const response = await axios.get(url, { responseType: 'arraybuffer' });
			const buffer = Buffer.from(response.data, 'utf-8');
			const filename = Math.random().toString(36).substring(2, 10);
			let path = `${dir}/${filename}`;

			// Checks if url is an image and sets temp file path if image needs processing
			if (imageType(buffer)) {
				path += imageType(buffer).ext;
			}
			else {
				return interaction.editReply({ content: 'Invalid image type. Command only supports .gif, .png, or .jpg' });
			}

			await sharp(buffer)
				.resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
				.toFile(path);

			interaction.guild.emojis
				.create({ attachment: path, name: name })
				.then(emoji => {
					const embed = new EmbedBuilder()
						.setTitle(`Added ${emoji} to server!`)
						.setDescription(`If you've enjoyed this bot so far, please consider voting for it.\nIt helps the bot grow. 🙂\n${mediaLinks}`);
					return interaction.editReply({ embeds: [embed] });
				})
				.catch(createEmojiError => {
					switch (createEmojiError.message) {
					case 'Invalid Form Body\nname: Must be between 2 and 32 in length.':
						interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'Invalid value in `name`.\nMust be between 2 to 32 characters in length.')] });
						break;
					case 'Invalid Form Body\nname: Must be between 2 and 32 in length. String value did not match validation regex.':
						interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'Invalid value in `name`.\nMust be between 2 to 32 characters in length and can only contain alphanumeric characters and underscores.')] });
						break;
					case 'Invalid Form Body\nname: String value did not match validation regex.':
						interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'Invalid value in `name`.\nMust only contain alphanumeric characters and underscores.')] });
						break;
					case 'Maximum number of emojis reached (50)':
						interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'No emoji slots available in server.')] });
						break;
					case 'Missing Permissions':
						interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'Bot is missing `Manage Emojis And Stickers` permission.')] });
						break;
					case 'Invalid Form Body\nimage: Invalid image data':
						interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'Invalid image type. Discord only supports .jpg, .jpeg, .png, and .gif images.')] });
						break;
					case 'Failed to resize asset below the maximum size: 262144':
						interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'Couldn\'t resize image below 256KB size limit.')] });
						break;
					default:
						console.error(`**Command:**\n${interaction.commandName}\n**Error Message:**\n${createEmojiError.message}\n**Raw Input:**\n${interaction.options.getString('url')}\n${interaction.options.getString('name')}`);
						return interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName)] });
					}
				})
				.finally(() => {
					fs.unlink(path, (err) => {
						if (err) console.error(`Unable to delete image: ${err}`);
					});
				});
		}
		catch (error) {
			switch (error.message) {
			case 'connect ECONNREFUSED ::1:80':
				await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'Invalid url in `url`.')] });
				break;
			default:
				console.error(`uploadEmoji error\n${error.message}`);
				return interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName)] });
			}
		}
	},
};
