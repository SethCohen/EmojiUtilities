const { createDatabase } = require('../helpers/dbModel');
const { Permissions } = require('discord.js');
const { setPerms, adminCommands, manageEmojisCommands } = require('../helpers/utilities');

module.exports = {
	name: 'guildCreate',
	async execute(guild) {
		// console.log(`guildCreate: ${guild.name}, ${guild.id}.`);
		createDatabase(guild.id);

		// Send greeting
		const channels = await guild.channels.cache;
		const foundChannel = await channels.find(channel => (channel.isText()
			&& channel.permissionsFor(guild.me).has('SEND_MESSAGES')
			&& channel.permissionsFor(guild.me).has('VIEW_CHANNEL')));
		if (foundChannel) {
			foundChannel.send('Hey, thanks for adding me to your server! ' +
				'\nThere\'s no need to do anything else, the database has been setup for you.' +
				'\nUse /help to find the list of commands. Thanks again and have a nice day!');
		}
		else {
			console.log('No channel access found. Welcome message not sent.');
		}

		// Add admin commands role perm
		guild.roles.cache.filter(role => role.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && !role.managed).each(adminRole => {
			setPerms(adminRole, adminCommands, true);
		});
		// Add manage emojis commands role perm
		guild.roles.cache.filter(role => role.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)).each(manageEmojisRole => {
			setPerms(manageEmojisRole, manageEmojisCommands, true);
		});
	},
};