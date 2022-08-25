const { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { sendErrorFeedback, mediaLinks, verifyEmojiString } = require('../helpers/utilities');

const getEmojiUrl = (emoji) => {
	const isAnimated = emoji[1];

	if (isAnimated) {
		return `https://cdn.discordapp.com/emojis/${emoji[3]}.gif`;
	}
	else {
		return `https://cdn.discordapp.com/emojis/${emoji[3]}.png`;
	}
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('emojisteal')
		.setDescription('Steals a custom emoji and uploads it to your server.')
		.addStringOption(option =>
			option.setName('emoji')
				.setDescription('The custom emoji to steal.')
				.setRequired(true),
		)
		.addStringOption(option =>
			option.setName('name')
				.setDescription('Name for the copied emoji')),
	async execute(interaction) {
		await interaction.deferReply();

		if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
			return interaction.editReply({
				content: 'You do not have enough permissions to use this command.\nRequires **Manage Emojis**.',
				ephemeral: true,
			});
		}

		const name = interaction.options.getString('name');
		const stringEmoji = interaction.options.getString('emoji');
		const verifiedEmoji = verifyEmojiString(stringEmoji);
		const url = getEmojiUrl(verifiedEmoji);

		interaction.guild.emojis
			.create({ attachment: url, name: name ? name : verifiedEmoji[2] })
			.then(emoji => {
				const embedSuccess = new EmbedBuilder()
					.setTitle(`Added ${emoji} to server!`)
					.setDescription(`If you've enjoyed this bot so far, please consider voting for it.\nIt helps the bot grow. 🙂\n${mediaLinks}`);
				return interaction.editReply({ embeds: [embedSuccess] });
			})
			.catch(async error => {
				switch (error.message) {
				case 'Failed to resize asset below the maximum size: 262144':
					await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'Couldn\'t resize image below 256KB size limit.')] });
					break;
				case 'Maximum number of emojis reached (50)':
					await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'No emoji slots available in server.')] });
					break;
				case 'Missing Permissions':
					await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'Bot is missing `Manage Emojis And Stickers` permission.')] });
					break;
				case 'Invalid Form Body\nname: Must be between 2 and 32 in length. String value did not match validation regex.':
					await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'Invalid emoji name specified in `name`. Name must be alphanumerical only and 2 to 32 characters in length. Please try again.')] });
					break;
				case 'Invalid Webhook Token':
					console.error('Discord API is down.');
					break;
				default:
					console.error(`**Command:**\n${interaction.commandName}\n**Error Message:**\n${error.message}\n**Raw Input:**\n${interaction.options.getString('emoji')}\n${interaction.options.getString('name')}`);
					return await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName)] });
				}
			});
	},
};
