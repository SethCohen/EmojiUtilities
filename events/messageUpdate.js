const {insertToDb} = require("../db_model");
const {deleteFromDb} = require("../db_model");
const {getSetting} = require("../db_model");

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage) {
        if (oldMessage.partial || newMessage.partial) {
            console.log(`messageUpdate partial found.`)
            // console.log("messageUpdate partial found.", oldMessage.partial, newMessage.partial)
        } else {
            // console.log(`messageUpdate: ${oldMessage.content}, ${oldMessage.author} -> ${newMessage.content}, ${newMessage.author}.`);
            if (newMessage.author.id !== newMessage.client.user.id) {
                if (getSetting(newMessage.guild.id, 'countmessages')) {
                    let guildId = newMessage.guild.id
                    let personId = newMessage.author.id
                    let dateTime = newMessage.createdAt.toISOString()

                    //if emoji content in messages

                    let re = /(?<=:)\d*(?=>)/g
                    let emojiIdsBefore = oldMessage.content.matchAll(re)
                    let emojiIdsAfter = newMessage.content.matchAll(re)
                    for (const emojiId of emojiIdsBefore) {
                        oldMessage.guild.emojis
                            .fetch(emojiId)
                            .then(emoji => deleteFromDb(guildId, emoji.id, personId, dateTime, "messageUpdate"))
                            .catch(() => {
                            })
                    }
                    for (const emojiId of emojiIdsAfter) {
                        newMessage.guild.emojis
                            .fetch(emojiId)
                            .then(emoji => insertToDb(guildId, emoji.id, personId, dateTime, "messageUpdate"))
                            .catch(() => {
                            })
                    }
                }
            }
        }
    },
};