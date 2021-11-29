const { Permissions } = require('discord.js');
const { setPerms, adminCommands, manageEmojisCommands } = require('../helpers/utilities');

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		client.user.setActivity('Now with slashes! /help');

		// Try and set role permissions to admin commands.
		client.guilds.cache.each(async guild => {
			// Add admin commands role perm
			guild.roles.cache.filter(role => role.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && !role.managed).each(adminRole => {
				setPerms(adminRole, adminCommands, true);
			});
			// Add manage emojis commands role perm
			guild.roles.cache.filter(role => role.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS) && !role.managed).each(manageEmojisRole => {
				setPerms(manageEmojisRole, manageEmojisCommands, true);
			});
		});
	},
};
