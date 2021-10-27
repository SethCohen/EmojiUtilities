const { createDatabase } = require('../db_model');
const { Permissions } = require('discord.js');

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

		const adminCommands = ['config', 'resetdb'];
		const manageEmojisCommands = ['renameemoji', 'uploademoji', 'copysteal'];

		// Add admin commands role perm
		guild.roles.cache.filter(role => role.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && !role.managed).each(adminRole => {
			// guild.commands.fetch()                       // Guild commands
			guild.client.application?.commands.fetch() // Global commands
				.then(async commands => {
					for (const name of adminCommands) {
						const foundCommand = await commands.find(command => command.name === name);
						const permission = [{ id: adminRole.id, type: 'ROLE', permission: true }];
						await foundCommand.permissions.add({ guild: guild.id, permissions: permission });
					}
				}).catch(e => console.error(e.toString())); // Unable to fetch guild commands.
		});
		// Add manage emojis commands role perm
		guild.roles.cache.filter(role => role.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS) && !role.managed).each(manageEmojisRole => {
			// guild.commands.fetch()                       // Guild commands
			guild.client.application?.commands.fetch() // Global commands
				.then(async commands => {
					for (const name of manageEmojisCommands) {
						const foundCommand = await commands.find(command => command.name === name);
						const permission = [{ id: manageEmojisRole.id, type: 'ROLE', permission: true }];
						await foundCommand.permissions.add({ guild: guild.id, permissions: permission });
					}
				}).catch(e => console.error(e.toString())); // Unable to fetch guild commands.
		});
	},
};