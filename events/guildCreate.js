const {createDatabase} = require('../db_model')
const {Permissions} = require("discord.js");

module.exports = {
    name: 'guildCreate',
    async execute(guild) {
        // console.log(`guildCreate: ${guild.name}, ${guild.id}.`);
        createDatabase(guild.id)

        // Send greeting
        let channels = await guild.channels.cache
        let foundChannel = await channels.find(channel => (channel.isText()
            && channel.permissionsFor(guild.me).has('SEND_MESSAGES')
            && channel.permissionsFor(guild.me).has('VIEW_CHANNEL')))
        if (foundChannel) {
            foundChannel.send("Hey, thanks for adding me to your server! " +
                "\nThere's no need to do anything else, the database has been setup for you." +
                "\nUse /help to find the list of commands. Thanks again and have a nice day!")
        } else {
            console.log("No channel access found. Welcome message not sent.")
        }

        // Set role perms
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

    },
};