import { createDatabase } from '../helpers/dbModel.js';
import { EmbedBuilder, ChannelType, PermissionsBitField } from 'discord.js';
import { mediaLinks } from '../helpers/utilities.js';

const postToAnyChannel = async (guild, embed) => {
	try {
		const channels = await guild.channels.cache;
		const foundChannel = await channels.find(channel => (channel.type === ChannelType.GuildText
			&& channel.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.SendMessages)
			&& channel.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.ViewChannel)));
		if (foundChannel) {
			foundChannel.send({ embeds: [embed] });
		}
		else {
			console.error('No channel access found. Welcome message not sent.');
		}
	}
	catch (e) {
		console.error(e);
	}
};

export default {
	name: 'guildCreate',
	async execute(guild) {
		// console.log(`guildCreate: ${guild.name}, ${guild.id}.`);

		const guildsCount = guild.client.guilds.cache.size;
		console.log(`Guild Created. Current Count: ${guildsCount}`);

		await createDatabase(guild.id);

		// Send greeting
		const embed = new EmbedBuilder()
			.setTitle('Hello! Nice to meet you!')
			.setDescription(mediaLinks + '\n\nThanks For Adding Me To Your Server!\nDon\'t worry, everything has been setup for you.\nJust make sure I have **View** access to all the channels otherwise I won\'t be able to track emoji usage.\nDo `/help` for a list of commands and if you have any issues or questions, feel free to join our support server.\n\nThanks again and have a nice day! 🙂');

		const publicUpdatesChannel = await guild.publicUpdatesChannel;
		if (publicUpdatesChannel) {
			publicUpdatesChannel
				.send({ embeds: [embed] })
				.catch(async error => {
					console.error(`Can't post to public updates channel in ${guild.name}: ${error.message}\nDefaulting to first available text channel.`);
					await postToAnyChannel(guild, embed);
				});
		}
		else {
			await postToAnyChannel(guild, embed);
		}
	},
};