const {insertToDb} = require("../db_model");
const {deleteFromDb} = require("../db_model");
const {getSetting} = require("../db_model");

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage) {
        if (oldMessage.partial || newMessage.partial) {
            // console.log(`messageUpdate partial found. Can't fetch oldMessage.`)
            return false;
        } else {
            // console.log(`messageUpdate: ${oldMessage.content}, ${oldMessage.author} -> ${newMessage.content}, ${newMessage.author}.`);

            if (newMessage.author.id !== newMessage.client.user.id) {              // Read messages from anyone other than bot
                if (getSetting(newMessage.guild.id, 'countmessages')) {     // Count messages
                    let guildId = newMessage.guild.id
                    let messageAuthorId = newMessage.author.id
                    let dateTime = newMessage.createdAt.toISOString()

                    // Finds all emojis in messages via regex
                    let re = /(?<=:)\d*(?=>)/g
                    let emojiIdsBefore = oldMessage.content.matchAll(re)
                    let emojiIdsAfter = newMessage.content.matchAll(re)

                    for (const emojiId of emojiIdsBefore) {
                        oldMessage.guild.emojis
                            .fetch(emojiId)
                            .then(emoji => deleteFromDb(guildId, emoji.id, messageAuthorId, dateTime, 'messageActivity', "messageUpdate"))
                            .catch(ignoreError => {
                                // Ignores failed fetches (As failed fetches means the emoji is not a guild emoji)
                            })
                    }
                    for (const emojiId of emojiIdsAfter) {
                        newMessage.guild.emojis
                            .fetch(emojiId)
                            .then(emoji => insertToDb(guildId, emoji.id, messageAuthorId, dateTime, 'messageActivity', "messageUpdate"))
                            .catch(ignoreError => {
                                // Ignores failed fetches (As failed fetches means the emoji is not a guild emoji)
                            })
                    }
                }
            }
        }
    },
};