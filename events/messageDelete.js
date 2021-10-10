const {deleteFromDb} = require("../db_model");
const {getSetting} = require("../db_model");

module.exports = {
    name: 'messageDelete',
    async execute(message) {
        if (message.partial) {
            // console.log(`messageDelete partial found. Can't fetch old messages.`)
            return false;
        } else {

            const implies = (p, q) => {
                // p -> q
                if (p) {
                    return q;
                } else {
                    return true;
                }
            }

            try {
                if (message.author.id !== message.client.user.id) {                 // Read messages from anyone other than bot

                    // Count messages
                    if (getSetting(message.guild.id, 'countmessages')) {
                        let guildId = message.guild.id
                        let messageAuthorId = message.author.id
                        let dateTime = message.createdAt.toISOString()

                        // Finds all emojis in messages via regex
                        let re = /(?<=:)\d*(?=>)/g
                        let emojiIds = message.content.matchAll(re)

                        for (const emojiId of emojiIds) {
                            message.guild.emojis
                                .fetch(emojiId)
                                .then(emoji => deleteFromDb(guildId, emoji.id, messageAuthorId, dateTime, 'messageActivity', "messageDelete - message"))
                                .catch(ignoreError => {
                                    // Ignores failed fetches (As failed fetches means the emoji is not a guild emoji)
                                })
                        }
                    }

                    // Count reacts
                    if (getSetting(message.guild.id, 'countreacts')) {
                        let guildId = message.guild.id
                        let messageAuthorId = message.author.id
                        let dateTime = message.createdAt.toISOString()

                        message.reactions.cache.each(reaction => {
                            reaction.users.cache.each(user => {
                                // Dont pass if message author is reaction user AND countselfreacts flag is false
                                if (
                                    implies(
                                        (message.author.id === user.id),
                                        getSetting(message.guild.id, 'countselfreacts')
                                    )
                                ) {
                                    deleteFromDb(guildId, reaction.emoji.id, user.id, dateTime, 'reactsSentActivity', "messageDelete - reaction:Sent")
                                    deleteFromDb(guildId, reaction.emoji.id, messageAuthorId, dateTime, 'reactsReceivedActivity', "messageDelete - reaction:Given")
                                }
                            })
                        })
                    }
                }
            } catch (e) {
                console.error(e)
            }
        }
    },
};