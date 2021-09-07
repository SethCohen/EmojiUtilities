const {insertToDb} = require("../db_model");
const {deleteFromDb} = require("../db_model");
const {getSetting} = require("../db_model");
module.exports = {
    name: 'messageUpdate',
    execute(oldMessage, newMessage) {
        console.log(`messageUpdate -> ${oldMessage.content}, ${oldMessage.author} -> ${newMessage.content}, ${newMessage.author}.`);
        if (newMessage.author.id !== newMessage.client.user.id) {
            if(getSetting(newMessage.guild.id, 'countmessages')){
                let guildId = newMessage.guild.id
                let personId = newMessage.author.id
                let dateTime = newMessage.createdAt.toISOString().split('T')[0]

                //if emoji content in messages

                let re = /(?<=:)\d*(?=>)/g
                let emojiIdsBefore = oldMessage.content.matchAll(re)
                let emojiIdsAfter = newMessage.content.matchAll(re)
                for (const emojiId of emojiIdsBefore) {
                    oldMessage.guild.emojis
                        .fetch(emojiId)
                        .then(emoji => deleteFromDb(guildId, emoji.id, personId, dateTime))
                        .catch(()=> {})
                }
                for (const emojiId of emojiIdsAfter) {
                    newMessage.guild.emojis
                        .fetch(emojiId)
                        .then(emoji => insertToDb(guildId, emoji.id, personId, dateTime))
                        .catch(()=> {})
                }
            }
        }
    },
};