const { Permissions } = require('discord.js');
const { setPerms, adminCommands, manageEmojisCommands } = require('../helpers/utilities');

module.exports = {
	name: 'roleUpdate',
	async execute(oldRole, newRole) {

		// Admin checks
		if (!oldRole.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && newRole.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
			// If a role was given Administrator perms...
			setPerms(newRole, adminCommands, true);
		}
		else if (oldRole.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && !newRole.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
			// If a role was removed Administrator perms...
			setPerms(newRole, adminCommands, false);
		}

		// Manage Emojis check
		if (!oldRole.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS) && newRole.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)) {
			// If a role was given Manage Emojis perms...
			setPerms(newRole, manageEmojisCommands, true);
		}
		else if (oldRole.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS) && !newRole.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)) {
			// If a role was removed Manage Emojis perms...
			setPerms(newRole, manageEmojisCommands, false);
		}

	},
};
