const { Permissions } = require('discord.js');
const { setPerms } = require('../helpers/setCommandPerm');

module.exports = {
	name: 'roleUpdate',
	async execute(oldRole, newRole) {
		const adminCommands = ['config', 'resetdb'];
		const manageEmojisCommands = ['renameemoji', 'uploademoji', 'copysteal'];

		// Admin checks
		if (!oldRole.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && newRole.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && !newRole.managed) {
			// If a role was given Administrator perms...
			setPerms(newRole, adminCommands, true);
		}
		else if (oldRole.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && !newRole.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && !newRole.managed) {
			// If a role was removed Administrator perms...
			setPerms(newRole, adminCommands, false);
		}

		// Manage Emojis check
		if (!oldRole.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS) && newRole.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS) && !newRole.managed) {
			// If a role was given Manage Emojis perms...
			setPerms(newRole, manageEmojisCommands, true);
		}
		else if (oldRole.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS) && !newRole.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS) && !newRole.managed) {
			// If a role was removed Manage Emojis perms...
			setPerms(newRole, manageEmojisCommands, false);
		}

	},
};
