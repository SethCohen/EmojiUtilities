const {deleteFromDb} = require("../db_model");
const {getSetting} = require("../db_model");

module.exports = {
    name: 'messageDelete',
    execute(message) {
        if (message.author.id !== message.client.user.id) {
            console.log(`messageDelete -> ${message.content}, ${message.author}.`);
            if(getSetting(message.guild.id, 'countmessages')){
                let guildId = message.guild.id
                let personId = message.author.id
                let dateTime = message.createdAt.toISOString().split('T')[0]

                let re = /(?<=:)\d*(?=>)/g
                let emojiIds = message.content.matchAll(re)
                for (const emojiId of emojiIds) {
                    message.guild.emojis
                        .fetch(emojiId)
                        .then(emoji => deleteFromDb(guildId, emoji.id, personId, dateTime))
                        .catch(()=> {})
                }
            }

            // TODO handle reactions
        }
    },
};