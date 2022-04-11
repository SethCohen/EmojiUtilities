const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');
const { verifyEmojiString, sendErrorFeedback, mediaLinks } = require('../helpers/utilities');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unlockemoji')
		.setDescription('Unlocks a specified emoji so it is accessible to everyone')
		.addStringOption(option =>
			option.setName('emoji')
				.setDescription('The emoji to unlock.')
				.setRequired(true),
		),
	async execute(interaction) {
		if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
			return interaction.reply({
				content: 'You do not have enough permissions to use this command.\nRequires **Administrator**.',
				ephemeral: true,
			});
		}

		await interaction.deferReply();

		const stringEmoji = interaction.options.getString('emoji');
		const verifiedEmoji = verifyEmojiString(stringEmoji);

		const emoji = await interaction.guild.emojis.fetch(verifiedEmoji[3]);

		emoji.edit({ roles: [`${interaction.guild.id}`] })
			.then(editedEmoji => {
				const embed = new MessageEmbed()
					.setTitle(`Unlocked ${editedEmoji} for role everyone.`)
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
	},
};
