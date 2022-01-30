const { Permissions } = require('discord.js');
const { setPerms, adminCommands, manageEmojisCommands } = require('../helpers/utilities');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		client.user.setActivity('Bot Now Uses Slash Commands! Re-Auth Bot If Needed.');

		// Sets role permissions for special commands.
		client.guilds.cache.each(async guild => {
			// Add admin commands role perms
			guild.roles.fetch()
				.then(roles => roles.filter(role => role.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
					.each(adminRole => {
						setPerms(adminRole, adminCommands, true);
					}))
				.catch(console.error);
			// Add manage emojis commands role perms
			guild.roles.fetch()
				.then(roles => roles.filter(role => role.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS))
					.each(manageEmojisRole => {
						setPerms(manageEmojisRole, manageEmojisCommands, true);
					}))
				.catch(console.error);
		});
	},
};
