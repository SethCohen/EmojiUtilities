const {deleteFromDb} = require("../db_model");
const {getSetting} = require("../db_model");

module.exports = {
    name: 'messageDelete',
    async execute(message) {

        // Ignore partials
        if (message.partial) {
            // console.log(`messageDelete partial found. Can't fetch old messages.`)
            return false;
        }

        // Ignore client
        if (message.author.id === message.client.user.id) {
            return false
        }

        try {
            if (getSetting(message.guildId, 'countmessages')) {     // Count messages
                let guildId = message.guildId
                let messageAuthorId = message.author.id
                let dateTime = message.createdAt.toISOString()

                // Finds all emojis in messages via regex
                let re = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/g
                let emojis = message.content.matchAll(re)

                for (const emoji of emojis) {
                    message.guild.emojis
                        .fetch(emoji[3])
                        .then(emoji => {
                            deleteFromDb(guildId, emoji.id, messageAuthorId, dateTime, 'messageActivity', "messageDelete - message")
                        })
                        .catch(ignoreError => {
                            // Ignores failed fetches (As failed fetches means the emoji is not a guild emoji)
                        })
                }
            }
        } catch (e) {
            console.error('messageDelete message delete failed', e)
        }

        try {
            if (getSetting(message.guildId, 'countreacts')) {   // Count reacts
                let guildId = message.guildId
                let messageAuthorId = message.author.id
                let dateTime = message.createdAt.toISOString()

                message.reactions.cache.each(reaction => {
                    reaction.users.cache.each(user => {
                        // p -> q       Dont pass if message author is reaction user AND countselfreacts flag is false
                        if (!(messageAuthorId === user.id) || getSetting(guildId, 'countselfreacts')) {
                            deleteFromDb(guildId, reaction.emoji.id, user.id, dateTime, 'reactsSentActivity', "messageDelete - reaction:Sent")
                            deleteFromDb(guildId, reaction.emoji.id, messageAuthorId, dateTime, 'reactsReceivedActivity', "messageDelete - reaction:Given")
                        }
                    })
                })
            }
        } catch (e) {
            console.error('messageDelete reaction delete failed', e)
        }
    },
};