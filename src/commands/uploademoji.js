const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const fs = require('fs');
const { exec } = require('child_process');

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
		await interaction.deferReply();

		// Checks for valid permissions
		if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)) {
			return interaction.editReply({
				content: 'You do not have enough permissions to use this command.\nYou need Manage Emojis perms to use this command.',
				ephemeral: true,
			});
		}

		const url = interaction.options.getString('url');
		const randGenName = Math.random().toString(36).substring(2, 10);
		const name = interaction.options.getString('name') ? interaction.options.getString('name') : randGenName;


		// Reads in url
		try {
			const response = await axios.get(url, { responseType: 'arraybuffer' });
			const buffer = Buffer.from(response.data, 'utf-8');
			const bytes = response.headers['content-length'];

			const filename = Math.random().toString(36).substring(2, 10);
			let path = `./src/temps/${filename}`;

			const magicHex = {
				jpg1: 'ffd8ffdb',
				jpg2: 'ffd8ffe0',
				jpg3: 'ffd8ffee',
				jpg4: 'ffd8ffe1',
				png: '89504e47',
				gif: '47494638',
			};

			switch (buffer.toString('hex', 0, 4)) {
			case (magicHex.jpg1):
				path += '.jpg';
				break;
			case (magicHex.jpg2):
				path += '.jpg';
				break;
			case (magicHex.jpg3):
				path += '.jpg';
				break;
			case (magicHex.jpg4):
				path += '.jpg';
				break;
			case magicHex.png:
				path += '.png';
				break;
			case magicHex.gif:
				path += '.gif';
				break;
			default:
				return interaction.editReply({ content: 'Invalid image type. Command only supports .gif, .png, or .jpg' });
			}

			if (bytes > 256000) {

				fs.writeFile(`${path}`, buffer, function(err) {
					if (err) throw err;
				});

				exec(`convert -resize "128x128>" ${path} ${path}`,
					(error, stdout, stderr) => {
						if (error) {
							console.error(`error: ${error.message}`);
							return;
						}
						if (stderr) {
							console.error(`stderr: ${stderr}`);
							return;
						}

						interaction.guild.emojis
							.create(path, name)
							.then(emoji => {
								return interaction.editReply({ content: `Added ${emoji} to server!` });
							})
							.catch(e => {
								return interaction.editReply({ content: `Emoji creation failed!\n${e.message}` });
							})
							.finally(() => {
								fs.unlink(path, (err) => {
									if (err) throw err;
									console.log(`${path} was deleted.`);
								});
							});
					});
			}
			else {
				interaction.guild.emojis
					.create(buffer, name)
					.then(emoji => {
						return interaction.editReply({ content: `Added ${emoji} to server!` });
					})
					.catch(e => {
						return interaction.editReply({ content: `Emoji creation failed!\n${e.message}` });
					});
			}
		}
		catch (e) {
			console.error(e.toString());
			return interaction.editReply({
				content: 'There was an error while executing this command!' +
					'\nIf you think this is a proper bug, either please join the support server for help or create a github issue describing the problem.' +
					'\nhttps://discord.gg/XaeERFAVfb' +
					'\nhttps://github.com/SethCohen/EmojiStatistics/issues', ephemeral: true,
			});
		}

	},
};
