const {createDatabase} = require('../db_model')

module.exports = {
    name: 'guildCreate',
    execute(guild) {
        // console.log(`guildCreate: ${guild.name}, ${guild.id}.`);
        createDatabase(guild.id)

        guild.channels.fetch().then(channels => {
            let foundChannel = channels.find(channel => channel.isText() && channel.permissionsFor(guild.me).has('SEND_MESSAGES'))
            // console.log(foundChannel)
            let myChannel = guild.channels.cache.get(foundChannel.id);
            myChannel.send("Hey, thanks for adding me to your server! " +
                "\nThere's no need to do anything else, the database has been setup for you." +
                "\nUse /help to find the list of commands. Thanks again and have a nice day!"
            );
        })
    },
};