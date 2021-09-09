const {deleteFromDb} = require("../db_model");
const {getSetting} = require("../db_model");

module.exports = {
    name: 'messageDeleteBulk',
    execute(messages) {
        messages.every(message => {
            if (message.partial) {
                console.log('messageDelete partial found.')
            } else {

                if (message.author.id !== message.client.user.id) {
                    // console.log(`messageDelete: ${message.content}, ${message.author}.`);
                    if (getSetting(message.guild.id, 'countmessages')) {
                        let guildId = message.guild.id
                        let personId = message.author.id
                        let dateTime = message.createdAt.toISOString()

                        let re = /(?<=:)\d*(?=>)/g
                        let emojiIds = message.content.matchAll(re)
                        for (const emojiId of emojiIds) {
                            message.guild.emojis
                                .fetch(emojiId)
                                .then(emoji => deleteFromDb(guildId, emoji.id, personId, dateTime, "messageDeleteBulk - message"))
                                .catch(() => {
                                })
                        }
                    }

                    if (getSetting(message.guild.id, 'countreacts')) {
                        let guildId = message.guild.id
                        let dateTime = message.createdAt.toISOString()

                        message.reactions.cache.each(reaction => {
                            reaction.users.cache.each(user => {
                                deleteFromDb(guildId, reaction.emoji.id, user.id, dateTime, "messageDeleteBulk - reaction")
                            })
                        })
                    }
                }
            }

        })
    },
};