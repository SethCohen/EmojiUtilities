const { Permissions, MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
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

		if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)) {
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
			.create(url, name ? name : verifiedEmoji[2])
			.then(emoji => {
				const embedSuccess = new MessageEmbed()
					.setTitle(`Added ${emoji} to server!`)
					.setDescription(`If you've enjoyed this bot so far, please consider voting for it.\nIt helps the bot grow. 🙂\n${mediaLinks}`);
				return interaction.editReply({ embeds: [embedSuccess] });
			})
			.catch(async error => {
				switch (error.message) {
				case 'Maximum number of emojis reached (50)':
					await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'No emoji slots available in server.')] });
					break;
				case 'Missing Permissions':
					await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'Bot is missing `Manage Emojis And Stickers` permission.')] });
					break;
				default:
					console.error(`Command:\n${interaction.commandName}\nError Message:\n${error.message}\nRaw Input:\n${interaction.options.getString('emoji')}\n${interaction.options.getString('name')}`);
					return await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName)] });
				}
			});


	},
};
