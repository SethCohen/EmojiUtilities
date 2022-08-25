const { createDatabase } = require('../helpers/dbModel');
const { EmbedBuilder, ChannelType } = require('discord.js');
const { mediaLinks } = require('../helpers/utilities');

const postToAnyChannel = async (guild, embed) => {
	const channels = await guild.channels.cache;
	const foundChannel = await channels.find(channel => (channel.type === ChannelType.GuildText
		&& channel.permissionsFor(guild.me).has('SEND_MESSAGES')
		&& channel.permissionsFor(guild.me).has('VIEW_CHANNEL')));
	if (foundChannel) {
		foundChannel.send({ embeds: [embed] });
	}
	else {
		console.error('No channel access found. Welcome message not sent.');
	}
};

module.exports = {
	name: 'guildCreate',
	async execute(guild) {
		// console.log(`guildCreate: ${guild.name}, ${guild.id}.`);

		const guildsCount = guild.client.guilds.cache.size;
		console.log(`Guild Created. Current Count: ${guildsCount}`);

		createDatabase(guild.id);

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