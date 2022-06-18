const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const axios = require('axios');
const { exec } = require('child_process');
const { sendErrorFeedback } = require('../helpers/utilities');
const converter = require('discord-emoji-converter');
const imageType = require('image-type');
const sharp = require('sharp');

const uploadEmoji = (interaction, input, name, tag) => {
	return interaction.guild.stickers.create(input, name, tag)
		.then(async sticker => {
			await interaction.editReply({
				content: `Created new sticker with name **${sticker.name}**!`,
			});
		})
		.catch(async error => {
			// console.error(`uploadEmoji error\n${error}`);
			switch (error.message) {
			case 'Maximum number of stickers reached (0)':
				await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'No sticker slots available in server.')] });
				break;
			case 'Missing Permissions':
				await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'Bot is missing `Manage Emojis And Stickers` permission.')] });
				break;
			case 'Asset exceeds maximum size: 33554432':
				await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'Unable to upload sticker to server. Output image is too large to upload to server. Try again with a more optimized gif.')] });
				break;
			case 'Invalid Form Body\nname: Must be between 2 and 30 in length.':
				await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'Unable to upload sticker.\n`name` too long. Must be between 2 and 30 characters in length.')] });
				break;
			case 'Sticker animation duration exceeds maximum of 5 seconds':
				await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'Unable to upload sticker.\nLength of gif exceeds maximum duration of 5 seconds.')] });
				break;
			default:
				console.error(`Command:\n${interaction.commandName}\nError Message:\n${error.message}\nRaw Input:\n${interaction.options.getString('url')}\n${interaction.options.getString('name')}\n${interaction.options.getString('tag')}`);
				await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName)] });
			}
		});
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stickerfy')
		.setDescription('Turns a given gif url into a sticker and adds it to server.')
		.addStringOption(option =>
			option.setName('url')
				.setDescription('The url of the gif to turn into a sticker.')
				.setRequired(true),
		)
		.addStringOption(option =>
			option.setName('name')
				.setDescription('The name for the sticker.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('tag')
				.setDescription('The Discord unicode emoji to represent the sticker.')
				.setRequired(true)),
	async execute(interaction) {
		if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)) {
			return interaction.reply({
				content: 'You do not have enough permissions to use this command.\nRequires **Manage Emojis**.',
				ephemeral: true,
			});
		}

		await interaction.deferReply();

		const url = interaction.options.getString('url');
		const name = interaction.options.getString('name');
		let tag = interaction.options.getString('tag');

		try {
			const dir = './temps';
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir);
			}

			tag = converter.getShortcode(tag, false);		// Convert unicode emoji to discord string name

			const response = await axios.get(url, { responseType: 'arraybuffer' });
			const buffer = Buffer.from(response.data, 'utf-8');
			const filename = Math.random().toString(36).substring(2, 10);
			const path = `${dir}/${filename}`;

			switch (imageType(buffer).ext) {
			case 'png': {
				await sharp(buffer)
					.resize(320, 320, { fit: 'contain' })
					.toFile(`${path}.png`);

				uploadEmoji(interaction, `${path}.png`, name, tag).finally(() => {
					fs.unlink(`${path}.png`, (err) => {
						if (err) {
							console.error(`Unable to delete image: ${err}`);
						}
					});
				});

				break;
			}
			case 'jpg': {
				await sharp(buffer)
					.resize(320, 320, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
					.png()
					.toFile(`${path}.png`);

				uploadEmoji(interaction, `${path}.png`, name, tag).finally(() => {
					fs.unlink(`${path}.png`, (err) => {
						if (err) {
							console.error(`Unable to delete image: ${err}`);
						}
					});
				});

				break;
			}
			case 'gif': {
				await sharp(buffer, { animated: true })
					.resize(320, 320, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
					.gif({ colours: 32, dither: 0.0 })
					.toFile(`${path}.gif`);

				exec(`gif2apng ${path}.gif`,
					async (execError, stdout, stderr) => {
						if (execError) throw execError;
						if (stderr) console.error(`gif2apng stderr ${stderr}`);

						uploadEmoji(interaction, `${path}.png`, name, tag).finally(() => {
							fs.unlink(`${path}.gif`, (err) => {
								if (err) {
									console.error(`Unable to delete image: ${err}`);
								}
							});
							fs.unlink(`${path}.png`, (err) => {
								if (err) {
									console.error(`Unable to delete image: ${err}`);
								}
							});
						});
					});

				break;
			}
			case 'webp': {
				break;
			}
			default: {
				return interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'Invalid image in `url`. Image must be either a gif, png, jpg, or webp.')] });
			}
			}
		}
		catch (error) {
			switch (error.message) {
			case 'Emoji doesn\'t exist':
				await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'Invalid value in `tag`.\nExpected default discord emoji, e.g. 🍌')] });
				break;
			case 'connect ECONNREFUSED ::1:80':
				await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'Invalid url in `url`.')] });
				break;
			case 'Cannot read properties of null (reading \'ext\')':
				await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'Invalid url in `url`.\nCan\'t detect image type. Try again with a direct link to the image.')] });
				break;
			default:
				console.error(`Command:\n${interaction.commandName}\nError Message:\n${error.message}\nRaw Input:\n${interaction.options.getString('url')}\n${interaction.options.getString('name')}\n${interaction.options.getString('tag')}`);
				await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName)] });
			}
		}

	},
};
