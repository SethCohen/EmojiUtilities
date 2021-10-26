const {Permissions} = require("discord.js");

module.exports = {
    name: 'roleUpdate',
    async execute(oldRole, newRole) {
        const adminCommands = ['config', 'resetdb']
        const manageEmojisCommands = ['renameemoji', 'uploademoji', 'copysteal']

        // Admin checks
        if (!oldRole.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && newRole.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && !newRole.managed) {
            // If a role was given Administrator perms...
            // newRole.guild.commands.fetch()                       // Guild commands
            newRole.client.application?.commands.fetch()   // Global commands
                .then(async commands => {
                    for (const name of adminCommands) {
                        let command = await commands.find(command => command.name === name)
                        let permission = [{id: newRole.id, type: 'ROLE', permission: true}]
                        await command.permissions.add({guild: newRole.guild.id, permissions: permission})
                    }
                }).catch(e => console.error(e.toString()));       // Unable to fetch guild commands.
        } else if (oldRole.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && !newRole.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && !newRole.managed) {
            // If a role was removed Administrator perms...
            // newRole.guild.commands.fetch()                       // Guild command
            newRole.client.application?.commands.fetch()   // Global commands
                .then(async commands => {
                    for (const name of adminCommands) {
                        let command = await commands.find(command => command.name === name)
                        let permission = [{id: newRole.id, type: 'ROLE', permission: false}]
                        await command.permissions.add({guild: newRole.guild.id, permissions: permission})
                    }
                }).catch(e => console.error(e.toString()));       // Unable to fetch guild commands.
        }

        // Manage Emojis check
        if (!oldRole.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS) && newRole.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS) && !newRole.managed) {
            // If a role was given Manage Emojis perms...
            // newRole.guild.commands.fetch()                       // Guild commands
            newRole.client.application?.commands.fetch()   // Global commands
                .then(async commands => {
                    for (const name of manageEmojisCommands) {
                        let command = await commands.find(command => command.name === name)
                        let permission = [{id: newRole.id, type: 'ROLE', permission: true}]
                        await command.permissions.add({guild: newRole.guild.id, permissions: permission})
                    }
                }).catch(e => console.error(e.toString()));       // Unable to fetch guild commands.
        } else if (oldRole.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS) && !newRole.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS) && !newRole.managed) {
            // If a role was removed Manage Emojis perms...
            // newRole.guild.commands.fetch()                       // Guild commands
            newRole.client.application?.commands.fetch()   // Global commands
                .then(async commands => {
                    for (const name of manageEmojisCommands) {
                        let command = await commands.find(command => command.name === name)
                        let permission = [{id: newRole.id, type: 'ROLE', permission: false}]
                        await command.permissions.add({guild: newRole.guild.id, permissions: permission})
                    }
                }).catch(e => console.error(e.toString()));       // Unable to fetch guild commands.
        }

    },
};
