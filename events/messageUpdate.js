const {insertToDb} = require("../db_model");
const {deleteFromDb} = require("../db_model");
const {getSetting} = require("../db_model");

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage) {
        // console.log(`messageUpdate: ${oldMessage.content}, ${oldMessage.author} -> ${newMessage.content}, ${newMessage.author}.`);

        // Ignore partials
        if (oldMessage.partial || newMessage.partial) {
            // console.log(`messageUpdate partial found. Can't fetch oldMessage.`)
            return false;
        }

        // Ignore client
        if (newMessage.author.id === newMessage.client.user.id) {
            return false
        }


        if (getSetting(newMessage.guildId, 'countmessages')) {     // Count messages
            let guildId = newMessage.guildId
            let messageAuthorId = newMessage.author.id
            let dateTime = newMessage.createdAt.toISOString()

            // Finds all emojis in messages via regex
            let re = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/g
            let emojisBefore = [...oldMessage.content.matchAll(re)]
            let emojisAfter = [...newMessage.content.matchAll(re)]

            // Delete old records
            for (const emoji of emojisBefore) {
                oldMessage.guild.emojis
                    .fetch(emoji[3])
                    .then(emoji => deleteFromDb(guildId, emoji.id, messageAuthorId, dateTime, 'messageActivity', "messageUpdate"))
                    .catch(ignoreError => {
                        // Ignores failed fetches (As failed fetches means the emoji is not a guild emoji)
                    })
            }

            // Insert new records
            for (const emoji of emojisAfter) {
                newMessage.guild.emojis
                    .fetch(emoji[3])
                    .then(emoji => insertToDb(guildId, emoji.id, messageAuthorId, dateTime, 'messageActivity', "messageUpdate"))
                    .catch(ignoreError => {
                        // Ignores failed fetches (As failed fetches means the emoji is not a guild emoji)
                    })
            }
        }
    },
};