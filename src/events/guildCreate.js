const { createDatabase } = require('../helpers/dbModel');
const { Permissions, MessageEmbed } = require('discord.js');
const { manageEmojisCommands, adminCommands, setPerms, mediaLinks } = require('../helpers/utilities');

module.exports = {
	name: 'guildCreate',
	async execute(guild) {
		// console.log(`guildCreate: ${guild.name}, ${guild.id}.`);

		const guildsCount = guild.client.guilds.cache.size;
		console.log(`Guild Created. Current Count: ${guildsCount}`);

		createDatabase(guild.id);

		// Send greeting
		const embed = new MessageEmbed()
			.setTitle('Hello! Nice to meet you!')
			.setDescription(mediaLinks + '\n\nThanks For Adding Me To Your Server!\nDon\'t worry, everything has been setup for you.\nJust make sure I have **View** access to all the channels otherwise I won\'t be able to track emoji usage.\n.Do `/help` for a list of commands and if you have any issues or questions, feel free to join our support server.\n\nThanks again and have a nice day! 🙂');

		const publicUpdatesChannel = await guild.publicUpdatesChannel;
		publicUpdatesChannel
			.send({ embeds: [embed] })
			.catch(async error => {
				console.error(`Can't post to public updates channel in ${guild.name}: ${error.message}\nDefaulting to first available text channel.`);
				const channels = await guild.channels.cache;
				const foundChannel = await channels.find(channel => (channel.isText()
					&& channel.permissionsFor(guild.me).has('SEND_MESSAGES')
					&& channel.permissionsFor(guild.me).has('VIEW_CHANNEL')));
				if (foundChannel) {
					foundChannel.send({ embeds: [embed] });
				}
				else {
					console.error('No channel access found. Welcome message not sent.');
				}
			});

		const guildRoles = await guild.roles.fetch();

		// Add admin commands role perm
		const adminRoles = await guildRoles.filter(role => role.permissions.has(Permissions.FLAGS.ADMINISTRATOR));
		await setPerms(guild, adminRoles, adminCommands, true);

		// Add manage emojis commands role perm
		const manageEmojisRoles = await guildRoles.filter(role => role.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS));
		await setPerms(guild, manageEmojisRoles, manageEmojisCommands, true);

	},
};