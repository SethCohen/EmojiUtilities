import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import { verifyEmojiString, sendErrorFeedback, mediaLinks } from '../helpers/utilities.js';

export default {
	data: new SlashCommandBuilder()
		.setName('lockemoji')
		.setDescription('Restricts a specified server-emoji to a specific role.')
		.addStringOption(option =>
			option.setName('emoji')
				.setDescription('The emoji to restrict.')
				.setRequired(true),
		)
		.addRoleOption(option =>
			option.setName('role')
				.setDescription('The role that has access to the emoji.')
				.setRequired(true)),
	async execute(interaction) {
		try {
			await interaction.deferReply();

			if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
				return interaction.editReply({
					content: 'You do not have enough permissions to use this command.\nRequires **Administrator**.',
					ephemeral: true,
				});
			}

			const role = interaction.options.getRole('role');

			const stringEmoji = interaction.options.getString('emoji');
			const verifiedEmoji = verifyEmojiString(stringEmoji);

			const emoji = await interaction.guild.emojis.fetch(verifiedEmoji[3]);

			emoji.edit({ roles: [role] })
				.then(editedEmoji => {
					const embed = new EmbedBuilder()
						.setTitle(`Restricted ${editedEmoji} to role @${role.name}!`)
						.setDescription(`If you've enjoyed this bot so far, please consider voting for it.\nIt helps the bot grow. 🙂\n${mediaLinks}`);
					return interaction.editReply({ embeds: [embed] });

				})
				.catch(editEmojiError => {
					switch (editEmojiError.message) {
					case 'Missing Permissions':
						interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'Bot is missing `Manage Emojis And Stickers` permission.')] });
						break;
					default:
						console.error(`Command:\n${interaction.commandName}\nError Message:\n${editEmojiError.message}\nRaw Input:\n${interaction.options.getString('emoji')}\n${interaction.options.getRole('role')}`);
						return interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName)] });
					}
				});
		}
		catch (e) {
			switch (e.message) {
			case 'Unknown Emoji':
				await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'No emoji detected in `emoji`')] });
				break;
			default:
				console.error(`Command:\n${interaction.commandName}\nError Message:\n${e.message}\nRaw Input:\n${interaction.options.getString('emoji')}\n${interaction.options.getRole('role')}`);
				return interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName)] });
			}
		}
	},
};
