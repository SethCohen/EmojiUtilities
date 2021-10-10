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
                    try {
                        let command = commands.find(command => command.name === 'config')
                        await command.permissions.add({
                            permissions: [
                                {
                                    id: role.id,
                                    type: 'ROLE',
                                    permission: true
                                },
                            ]
                        })
                    } catch (e) {
                        console.error(e.toString(), `for guild id ${guild.id}. No ADMINISTRATOR role found.`)
                    }
                }).catch(e => console.error(e.toString()));       // Unable to fetch guild commands.
        })
    },
};