const { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { mediaLinks, sendErrorFeedback, verifyEmojiString } = require('../helpers/utilities');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('renameemoji')
		.setDescription('Renames a specified custom emoji.')
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
		try {
			await interaction.deferReply();

			if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
				return interaction.editReply({
					content: 'You do not have enough permissions to use this command.\nRequires **Manage Emojis**.',
					ephemeral: true,
				});
			}

			const stringEmoji = interaction.options.getString('emoji');
			const verifiedEmoji = verifyEmojiString(stringEmoji);

			interaction.guild.emojis.fetch(verifiedEmoji[3])
				.then(fetchedEmoji => {
					const name = interaction.options.getString('name');
					fetchedEmoji.edit({ name: `${name}` })
						.then(emoji => {
							const embed = new EmbedBuilder()
								.setTitle(`${emoji} has been renamed to ${emoji.name}.`)
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
							case 'Missing Permissions':
								interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'Bot is missing `Manage Emojis And Stickers` permission.')] });
								break;
							default:
								console.error(`Command:\n${interaction.commandName}\nError Message:\n${error.message}\nRaw Input:\n${interaction.options.getString('emoji')}\n${interaction.options.getString('name')}`);
								return interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName)] });
							}
						});
				})
				.catch(error => {
					switch (error.message) {
					case 'Unknown Emoji':
						interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'No valid emoji found in `emoji`.\nMake sure emoji is from this server.')] });
						break;
					default:
						console.error(`Command:\n${interaction.commandName}\nError Message:\n${error.message}\nRaw Input:\n${interaction.options.getString('emoji')}\n${interaction.options.getString('name')}`);
						return interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName)] });
					}
				});
		}
		catch (error) {
			switch (error.message) {
			case 'Cannot read properties of null (reading \'3\')':
				interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'No emoji found in `emoji`.')] });
				break;
			default:
				console.error(`Command:\n${interaction.commandName}\nError Message:\n${error.message}\nRaw Input:\n${interaction.options.getString('emoji')}\n${interaction.options.getString('name')}`);
				return interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName)] });
			}
		}
	},
};
