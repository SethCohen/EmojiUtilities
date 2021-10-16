const {Permissions} = require("discord.js");

module.exports = {
    name: 'roleUpdate',
    async execute(oldRole, newRole) {
        if (!oldRole.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && newRole.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            // If a role was given Administrator perms...
            newRole.client.application?.commands.fetch()
                .then(async commands => {
                    let configCommand = commands.find(command => command.name === 'config')
                    let resetdbCommand = commands.find(command => command.name === 'resetdb')
                    try {
                        let permission = [{id: newRole.id, type: 'ROLE', permission: true}]
                        await configCommand.permissions.add({guild: newRole.guild.id, permissions: permission})
                        await resetdbCommand.permissions.add({guild: newRole.guild.id, permissions: permission})
                    } catch (e) {
                        console.error(e.toString(), `for guild id ${newRole.guild.id}.`)
                    }
                }).catch(e => console.error(e.toString()));       // Unable to fetch guild commands.
        } else if (oldRole.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && !newRole.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            // If a role was given Administrator perms...
            newRole.client.application?.commands.fetch()
                .then(async commands => {
                    let configCommand = commands.find(command => command.name === 'config')
                    let resetdbCommand = commands.find(command => command.name === 'resetdb')
                    try {
                        let permission = [{id: newRole.id, type: 'ROLE', permission: false}]
                        await configCommand.permissions.add({guild: newRole.guild.id, permissions: permission})
                        await resetdbCommand.permissions.add({guild: newRole.guild.id, permissions: permission})
                    } catch (e) {
                        console.error(e.toString(), `for guild id ${newRole.guild.id}.`)
                    }
                }).catch(e => console.error(e.toString()));       // Unable to fetch guild commands.
        }
    },
};
