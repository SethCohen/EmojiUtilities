const {createDatabase} = require('../db_model')

module.exports = {
    name: 'guildCreate',
    execute(guild) {
        console.log(`guildCreate -> ${guild.name}, ${guild.id}.`);
        createDatabase(guild.id)
    },
};