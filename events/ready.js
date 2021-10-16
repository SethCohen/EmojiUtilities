const {Permissions} = require("discord.js");
module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        client.user.setActivity('Now with slashes! /help');

        // Try and set role permissions to admin commands.
        client.guilds.cache.each(async guild => {
            let role = await guild.roles.cache.find(role => role.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
            guild.client.application?.commands.fetch()
                .then(async commands => {
                    let configCommand = commands.find(command => command.name === 'config')
                    let resetdbCommand = commands.find(command => command.name === 'resetdb')
                    try {
                        let permission = [{id: role.id, type: 'ROLE', permission: true}]
                        await configCommand.permissions.add({guild: guild.id, permissions: permission})
                        await resetdbCommand.permissions.add({guild: guild.id, permissions: permission})
                    } catch (e) {
                        console.error(e.toString(), `for guild id ${guild.id}.`)
                    }
                }).catch(e => console.error(e.toString()));       // Unable to fetch guild commands.
        })
    },
};
