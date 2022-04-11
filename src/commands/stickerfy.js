const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const axios = require('axios');
const { exec } = require('child_process');
const { sendErrorFeedback } = require('../helpers/utilities');
const converter = require('discord-emoji-converter');

const uploadSticker = async (interaction, path, name, tag) => {
	try {
		const sticker = await interaction.guild.stickers.create(`${path}.png`, name, tag);
		await interaction.editReply({
			content: `Created new sticker with name **${sticker.name}**!`,
		});
	}
	catch (error) {
		switch (error.message) {
		case 'Maximum number of stickers reached (0)':
			await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'No sticker slots available in server.')] });
			break;
		case 'Missing Permissions':
			await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'Bot is missing `Manage Emojis And Stickers` permission.')] });
			break;
		case 'Asset exceeds maximum size: 33554432':
			await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'Unable to upload sticker to server. Output sticker is too large.\nUnable to optimize gif into a sticker that fits Discord\'s upload requirements.\nThis may be because the input gif is either too large or too small, contains too much noise, colours, frames, etc.\nTry optimizing the gif before using the command.')] });
			break;
		default:
			console.error(`Command:\n${interaction.commandName}\nError Message:\n${error.message}\nRaw Input:\n${interaction.options.getString('url')}\n${interaction.options.getString('name')}\n${interaction.options.getString('tag')}`);
			await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName)] });
		}
	}
	finally {
		fs.unlink(`${path}.gif`, (err) => {
			if (err) {
				console.error(`Unable to delete image: ${err}`);
			}
			else {
				console.log(`${path}.gif was deleted.`);
			}
		});
		fs.unlink(`${path}.png`, (err) => {
			if (err) {
				console.error(`Unable to delete image: ${err}`);
			}
			else {
				console.log(`${path}.png was deleted.`);
			}
		});

	}

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
			return interaction.editReply({
				content: 'You do not have enough permissions to use this command.\nRequires **Manage Emojis**.',
				ephemeral: true,
			});
		}

		await interaction.deferReply();

		const url = interaction.options.getString('url');
		const name = interaction.options.getString('name');
		let tag = interaction.options.getString('tag');

		try {
			tag = converter.getShortcode(tag, false);		// Convert unicode emoji to discord string name

			const response = await axios.get(url, { responseType: 'arraybuffer' });
			const buffer = Buffer.from(response.data, 'utf-8');
			const bytes = response.headers['content-length'];
			const magicHex = {
				gif: '47494638',
			};

			// Checks for if image is a gif, else cancel command.
			if (buffer.toString('hex', 0, 4) === magicHex.gif) {
				const filename = Math.random().toString(36).substring(2, 10);
				const path = `./src/temps/${filename}`;

				if (bytes > 500000) {

					fs.writeFile(`${path}.gif`, buffer, function(err) {
						if (err) throw err;
					});

					// Uses several CLI toots to process a gif into an apng.
					// Each command has been heavily tested for optimal optimizations to retain gif quality
					// whilst conforming to discord's stickers upload limitations.
					exec(`gifsicle --colors 32 --resize-touch 320x320 ${path}.gif -o ${path}.gif && gifsicle -S 320x320 ${path}.gif -o ${path}.gif && gif2apng ${path}.gif`,
						async (execError, stdout, stderr) => {
							if (execError) throw execError;
							if (stderr) console.error(stderr);

							await uploadSticker(interaction, path, name, tag);

						});
				}
				else {
					// Converts gif to apng
					exec(`gif2apng ${path}.gif`,
						async (execError, stdout, stderr) => {
							if (execError) throw execError;
							if (stderr) console.error(stderr);

							await uploadSticker(interaction, path, name, tag);
						});
				}
			}
			else {
				return interaction.editReply({
					content: 'Sorry! I couldn\'t stickerfy your URL. Your URL was not a .gif file. Please try again!',
					ephemeral: true,
				});
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
			default:
				console.error(error.message);
				return interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName)] });
			}
		}

	},
};
