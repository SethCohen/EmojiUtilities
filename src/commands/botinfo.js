import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import ms from 'ms';
import { getGetCount } from '../helpers/dbModel.js';
import { mediaLinks } from '../helpers/utilities.js';

const getAllGuildsEmojiCount = (interaction) => {
	let totalEmojiCount = 0;
	interaction.client.guilds.cache.each(async guild => {
		totalEmojiCount += await getGetCount(guild.id, null, '0');
	});
	return totalEmojiCount;
};

export default {
	data: new SlashCommandBuilder()
		.setName('botinfo')
		.setDescription('Displays info about the bot.'),
	async execute(interaction) {
		await interaction.deferReply();

		const guildsCount = interaction.client.guilds.cache.size;
		const uptime = interaction.client.uptime;
		const botCreatedDate = interaction.client.user.createdAt.toDateString();

		const embedSuccess = new EmbedBuilder()
			.setTitle(`${interaction.client.user.username}`)
			.setDescription(mediaLinks)
			.setThumbnail(`${interaction.client.user.avatarURL()}`)
			.addFields(
				{ name: 'Guilds In:', value: guildsCount.toString(), inline: true },
				{ name: 'Current Uptime:', value: ms(uptime), inline: true },
				{ name: 'Bot Created:', value: botCreatedDate, inline: true },
				{
					name: 'Emoji Usages Recorded:',
					value: getAllGuildsEmojiCount(interaction).toString(),
					inline: true,
				},
			);

		return await interaction.editReply({ embeds: [embedSuccess] });

	},
};
