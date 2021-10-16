const {Permissions} = require("discord.js");
module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        client.user.setActivity('Now with slashes! /help');

        // Try and set role permissions to admin commands.
        client.guilds.cache.each(guild => {
            let role = guild.roles.cache.find(role => role.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
            guild.commands.fetch()
                .then(async commands => {
                    let configCommand = commands.find(command => command.name === 'config')
                    let resetdbCommand = commands.find(command => command.name === 'resetdb')
                    try {
                        let permission = {permissions: [{id: role.id, type: 'ROLE', permission: true}]}
                        await configCommand.permissions.add(permission)
                        await resetdbCommand.permissions.add(permission)
                    } catch (e) {
                        console.error(e.toString(), `for guild id ${guild.id}. No ADMINISTRATOR role found.`)
                    }
                }).catch(e => console.error(e.toString()));       // Unable to fetch guild commands.
        })
    },
};
