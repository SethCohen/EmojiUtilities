const {insertToDb} = require("../db_model");
const {getSetting} = require('../db_model')

module.exports = {
    name: 'messageCreate',
    execute(message) {
        if (message.author.id !== message.client.user.id) {
            console.log(`messageCreate -> ${message.content} from ${message.author}.`);
            if(getSetting(message.guild.id, 'countmessages')){
                let guildId = message.guild.id
                let personId = message.author.id
                let dateTime = message.createdAt.toISOString().split('T')[0]

                let re = /(?<=:)\d*(?=>)/g
                let emojiIds = message.content.matchAll(re)
                for (const emojiId of emojiIds) {
                    message.guild.emojis
                        .fetch(emojiId)
                        .then(emoji => insertToDb(guildId, emoji.id, personId, dateTime))
                        .catch(()=> {})
                }
            }
        }
    },
};