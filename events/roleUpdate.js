const {Permissions} = require("discord.js");

module.exports = {
    name: 'roleUpdate',
    execute(oldRole, newRole) {
        if (!oldRole.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && newRole.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            // If a role was given Administrator perms...

            newRole.guild.commands.fetch()
                .then(async commands => {
                    let configCommand = commands.find(command => command.name === 'config')
                    let resetdbCommand = commands.find(command => command.name === 'resetdb')
                    try {
                        let permission = {permissions: [{id: newRole.id, type: 'ROLE', permission: true}]}
                        await configCommand.permissions.add(permission)
                        await resetdbCommand.permissions.add(permission)
                    } catch (e) {
                        console.error(e.toString(), `for guild id ${newRole.guild.id}. No ADMINISTRATOR role found.`)
                    }
                }).catch(e => console.error(e.toString()));
        } else if (oldRole.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && !newRole.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            // If a role had its Administrator perms taken away...

            newRole.guild.commands.fetch()
                .then(async commands => {
                    let configCommand = commands.find(command => command.name === 'config')
                    let resetdbCommand = commands.find(command => command.name === 'resetdb')
                    try {
                        let permission = {permissions: [{id: newRole.id, type: 'ROLE', permission: false}]}
                        await configCommand.permissions.add(permission)
                        await resetdbCommand.permissions.add(permission)
                    } catch (e) {
                        console.error(e.toString(), `for guild id ${newRole.guild.id}. No ADMINISTRATOR role found.`)
                    }
                }).catch(e => console.error(e.toString()));
        }


    },
};
