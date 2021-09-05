module.exports = {
    name: 'guildCreate',
    execute(guild) {
        console.log(`guildCreate -> ${guild.name}, ${guild.id}.`);
    },
};