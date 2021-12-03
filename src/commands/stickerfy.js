const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const axios = require('axios');
const { exec } = require('child_process');
const { sendErrorFeedback } = require('../helpers/utilities');
const converter = require('discord-emoji-converter');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stickerfy')
		.setDescription('Turns a given gif url into a sticker and adds it to server.')
		.setDefaultPermission(false)
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
		await interaction.deferReply();

		// Checks for valid permissions
		if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)) {
			return interaction.editReply({
				content: 'You do not have enough permissions to use this command.\nRequires **Manage Emojis**.',
				ephemeral: true,
			});
		}

		const url = interaction.options.getString('url');
		const name = interaction.options.getString('name');
		let tag = interaction.options.getString('tag');
		try {
			tag = converter.getShortcode(tag, false);
		}
		catch (e) {
			console.error(e);
			return interaction.editReply({ content: 'No valid unicode tag found! Please try again!', ephemeral: true });
		}

		const magicHex = {
			jpg: 'ffd8ffe0',
			png: '89504e47',
			gif: '47494638',
		};

		try {
			const response = await axios.get(url, { responseType: 'arraybuffer' });
			const buffer = Buffer.from(response.data, 'utf-8');
			const bytes = response.headers['content-length'];

			if (buffer.toString('hex', 0, 4) === magicHex.gif) {
				const filename = Math.random().toString(36).substring(2, 10);
				const path = `./src/temps/${filename}`;

				fs.writeFile(`${path}.gif`, buffer, function(err) {
					if (err) throw err;
				});

				if (bytes > 500000) {
					exec(`gifsicle --resize-touch 320x320 ${path}.gif -o ${path}.gif && gifsicle -S 320x320 --colors 32 ${path}.gif -o ${path}.gif && gif2apng ${path}.gif`,
						(error, stdout, stderr) => {
							if (error) {
								console.error(`error: ${error.message}`);
								return;
							}
							if (stderr) {
								console.error(`stderr: ${stderr}`);
								return;
							}

							interaction.guild.stickers.create(`${path}.png`, name, tag)
								.then(sticker => {

									fs.unlink(`${path}.gif`, (err) => {
										if (err) throw err;
										console.log(`${path} was deleted.`);
									});
									fs.unlink(`${path}.png`, (err) => {
										if (err) throw err;
										console.log(`${path} was deleted.`);
									});

									return interaction.editReply({
										content: `Created new sticker with name **${sticker.name}**!`,
									});
								})
								.catch(e => {
									console.error(e);
									return interaction.editReply({
										content: 'There was an error while executing this command!' + sendErrorFeedback(),
									});
								});
						});
				}
				else {
					exec(`gif2apng ${path}.gif`,
						(error, stdout, stderr) => {
							if (error) {
								console.error(`error: ${error.message}`);
								return;
							}
							if (stderr) {
								console.error(`stderr: ${stderr}`);
								return;
							}

							interaction.guild.stickers.create(`${path}.png`, name, tag)
								.then(sticker => {

									fs.unlink(`${path}.gif`, (err) => {
										if (err) throw err;
										console.log(`${path} was deleted.`);
									});
									fs.unlink(`${path}.png`, (err) => {
										if (err) throw err;
										console.log(`${path} was deleted.`);
									});

									return interaction.editReply({
										content: `Created new sticker with name **${sticker.name}**!`,
									});
								})
								.catch(e => {
									console.error(e);
									return interaction.editReply({
										content: 'There was an error while executing this command!' + sendErrorFeedback(),
									});
								});
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
		catch (e) {
			console.error(e);
			return interaction.editReply({
				content: 'There was an error while executing this command!' +
					'\nIf you think this is a proper bug, either please join the support server for help or create a github issue describing the problem.' +
					'\nhttps://discord.gg/XaeERFAVfb' +
					'\nhttps://github.com/SethCohen/EmojiUtilities/issues', ephemeral: true,
			});
		}

	},
};
