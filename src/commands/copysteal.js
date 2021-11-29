const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { sendErrorFeedback } = require('../helpers/utilities');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('copysteal')
		.setDescription('Steals a custom emoji and uploads it to your server.')
		.setDefaultPermission(false)
		.addStringOption(option =>
			option.setName('emoji')
				.setDescription('The custom emoji to steal.')
				.setRequired(true),
		)
		.addStringOption(option =>
			option.setName('name')
				.setDescription('Name for the copied emoji')),
	execute(interaction) {
		if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)) {
			return interaction.reply({
				content: 'You do not have enough permissions to use this command.\nRequires **Manage Emojis**.',
				ephemeral: true,
			});
		}

		const stringEmoji = interaction.options.getString('emoji');
		const name = interaction.options.getString('name');

		const re = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/;
		const regexEmoji = stringEmoji.match(re);

		if (regexEmoji) {

			// Checks for if emoji is animated or not.
			let url;
			if (regexEmoji[1]) {
				url = `https://cdn.discordapp.com/emojis/${regexEmoji[3]}.gif`;
			}
			else {
				url = `https://cdn.discordapp.com/emojis/${regexEmoji[3]}.png`;
			}

			interaction.guild.emojis
				.create(url, name ? name : regexEmoji[2])
				.then(emoji => {
					return interaction.reply({ content: `Added ${emoji} to server!` });
				})
				.catch(e => {
					console.error(e);
					return interaction.reply({ content: `Emoji creation failed!${sendErrorFeedback()}` });
				});
		}
		else {
			return interaction.reply({
				content: 'No custom emoji was found in your message!',
				ephemeral: true,
			});

		}


	},
};
