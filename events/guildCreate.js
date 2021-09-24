const {createDatabase} = require('../db_model')

module.exports = {
    name: 'guildCreate',
    async execute(guild) {
        // console.log(`guildCreate: ${guild.name}, ${guild.id}.`);
        createDatabase(guild.id)

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
    },
};