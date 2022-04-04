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
			const guildRoles = await guild.roles.fetch();

			// Add admin commands role perm
			const adminRoles = await guildRoles.filter(role => role.permissions.has(Permissions.FLAGS.ADMINISTRATOR));
			await setPerms(guild, adminRoles, adminCommands, true);

			// Add manage emojis commands role perm
			const manageEmojisRoles = await guildRoles.filter(role => role.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS));
			await setPerms(guild, manageEmojisRoles, manageEmojisCommands, true);

		});
	},
};
