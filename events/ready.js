const {Permissions} = require("discord.js");
module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        client.user.setActivity('Now with slashes! /help');

        const adminCommands = ['config', 'resetdb']
        const manageEmojisCommands = ['renameemoji', 'uploademoji', 'copysteal']

        // Try and set role permissions to admin commands.
        client.guilds.cache.each(async guild => {
            // Add admin commands role perm
            guild.roles.cache.filter(role => role.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && !role.managed).each(adminRole => {
                // guild.commands.fetch()                       // Guild commands
                guild.client.application?.commands.fetch()   // Global commands
                    .then(async commands => {
                        for (const name of adminCommands) {
                            let command = await commands.find(command => command.name === name)
                            let permission = [{id: adminRole.id, type: 'ROLE', permission: true}]
                            await command.permissions.add({guild: guild.id, permissions: permission})
                        }
                    }).catch(e => console.error(e.toString()));       // Unable to fetch guild commands.
            })
            // Add manage emojis commands role perm
            guild.roles.cache.filter(role => role.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS) && !role.managed).each(manageEmojisRole => {
                // guild.commands.fetch()                       // Guild commands
                guild.client.application?.commands.fetch()   // Global commands
                    .then(async commands => {
                        for (const name of manageEmojisCommands) {
                            let command = await commands.find(command => command.name === name)
                            let permission = [{id: manageEmojisRole.id, type: 'ROLE', permission: true}]
                            await command.permissions.add({guild: guild.id, permissions: permission})
                        }
                    }).catch(e => console.error(e.toString()));       // Unable to fetch guild commands.
            })
        })
    },
};
