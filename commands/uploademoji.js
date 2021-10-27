const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const tinify = require('tinify');
const { tinifyKey } = require('../config.json');
const request = require('request');

tinify.key = tinifyKey;

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

		// TODO replace request with axios
		// Reads in url
		try {
			request({
				url: url,
				method: 'HEAD',
			}).on('response', response => {
				const bytes = response.headers['content-length'];
				if (bytes > 256000) {
					// Checks if file at url is greater than discord emote filesize limit; 256kb.

					// TODO replace tinify with imagemagick/optipng/gif2apng/etc

					// Uses tinify api to compress and upload an image as a server emoji.
					tinify.fromUrl(url).toBuffer()
						.then(image => {
							interaction.guild.emojis
								.create(image, name)
								.then(emoji => {
									return interaction.editReply({ content: `Added ${emoji} to server!` });
								})
								.catch(e => {
									return interaction.editReply({ content: `Emoji creation failed!\n${e.message}` });
								});
						})
						.catch(e => {
							return interaction.editReply({ content: `Compression failed!\n${e.message}` });
						});
				}
				else {
					interaction.guild.emojis
						.create(url, name)
						.then(emoji => {
							return interaction.editReply({ content: `Added ${emoji} to server!` });
						})
						.catch(e => {
							return interaction.editReply({ content: `Emoji creation failed!\n${e.message}` });
						});
				}
			}).on('error', error => {
				console.error(error.toString());
			});
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
