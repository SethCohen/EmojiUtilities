const { Permissions, MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { mediaLinks } = require('../helpers/utilities');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('renameemoji')
		.setDescription('Renames a specified custom emoji.')
		.setDefaultPermission(false)
		.addStringOption(option =>
			option.setName('emoji')
				.setDescription('The emoji to rename.')
				.setRequired(true),
		)
		.addStringOption(option =>
			option.setName('name')
				.setDescription('The new name for the emoji.')
				.setRequired(true)),
	async execute(interaction) {
		// Checks for valid permissions
		if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)) {
			return interaction.reply({
				content: 'You do not have enough permissions to use this command.\nRequires **Manage Emojis**.',
				ephemeral: true,
			});
		}

		// Validates emoji option.
		const stringEmoji = interaction.options.getString('emoji');
		const re = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/;
		const regexEmoji = stringEmoji.match(re);
		try {
			interaction.guild.emojis.fetch(regexEmoji[3])
				.then(fetchedEmoji => {
					const name = interaction.options.getString('name');
					fetchedEmoji.edit({ name: `${name}` })
						.then(emoji => {
							const embed = new MessageEmbed()
								.setTitle(`${emoji} has been renamed to ${emoji.name}.`)
								.setDescription(`If you've enjoyed this bot so far, please consider voting for it.\nIt helps the bot grow. 🙂\n${mediaLinks}`);
							return interaction.reply({ embeds: [embed] });
						})
						.catch(e => {
							console.error('renameemoji failed on edit.', e);
						});
				})
				.catch(e => {
					console.error('renameemoji failed on fetch.', e);
				});
		}
		catch (e) {
			console.error(e);
			return interaction.reply({ content: 'No custom emoji found in string.', ephemeral: true });

		}

	},
};
