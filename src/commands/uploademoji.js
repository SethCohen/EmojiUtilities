const { Permissions, MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const fs = require('fs');
const { exec } = require('child_process');
const { sendErrorFeedback, mediaLinks } = require('../helpers/utilities');
const imageType = require('image-type');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('uploademoji')
		.setDescription('Uploads a given url as an emoji.')
		.setDefaultPermission(false)
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
				content: 'You do not have enough permissions to use this command.\nRequires **Manage Emojis**.',
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

			if (imageType(buffer)) {
				path += imageType(buffer).ext;
			}
			else {
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
								const embed = new MessageEmbed()
									.setTitle(`Added ${emoji} to server!`)
									.setDescription(`If you've enjoyed this bot so far, please consider voting for it.\nIt helps the bot grow. 🙂\n${mediaLinks}`);
								return interaction.editReply({ embeds: [embed] });
							})
							.catch(error => {
								switch (error.message) {
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
								default:
									console.error(error.message);
									return interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName)] });
								}

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
						const embed = new MessageEmbed()
							.setTitle(`Added ${emoji} to server!`)
							.setDescription(`If you've enjoyed this bot so far, please consider voting for it.\nIt helps the bot grow. 🙂\n${mediaLinks}`);
						return interaction.editReply({ embeds: [embed] });
					})
					.catch(error => {
						switch (error.message) {
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
						default:
							console.error(error.message);
							return interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName)] });
						}

					});
			}
		}
		catch (error) {
			switch (error.message) {
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
