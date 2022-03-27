const { createDatabase } = require('../helpers/dbModel');
const { Permissions } = require('discord.js');
const { manageEmojisCommands, adminCommands, setPerms } = require('../helpers/utilities');

module.exports = {
	name: 'guildCreate',
	async execute(guild) {
		// console.log(`guildCreate: ${guild.name}, ${guild.id}.`);

		const guildsCount = guild.client.guilds.cache.size;
		console.log(`Guild Created. Current Count: ${guildsCount}`);

		createDatabase(guild.id);

		/* // Send greeting
		const channels = await guild.channels.cache;
		const foundChannel = await channels.find(channel => (channel.isText()
			&& channel.permissionsFor(guild.me).has('SEND_MESSAGES')
			&& channel.permissionsFor(guild.me).has('VIEW_CHANNEL')));
		if (foundChannel) {
			foundChannel.send('Hey, thanks for adding me to your server! ' +
				'\nThere\'s no need to do anything else, the database has been setup for you.' +
				'\nUse `/` to access the list of commands. Thanks again and have a nice day!');
		}
		else {
			console.error('No channel access found. Welcome message not sent.');
		}*/

		const guildRoles = await guild.roles.fetch();

		// Add admin commands role perm
		const adminRoles = await guildRoles.filter(role => role.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS));
		await setPerms(guild, adminRoles, adminCommands, true);

		// Add manage emojis commands role perm
		const manageEmojisRoles = await guildRoles.filter(role => role.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS));
		await setPerms(guild, manageEmojisRoles, manageEmojisCommands, true);

	},
};