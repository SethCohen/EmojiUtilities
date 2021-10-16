// customly modified MessageReactionRemoveAll.js from discord.js module

const {deleteFromDb} = require("../db_model");
const {getSetting} = require("../db_model");
module.exports = {
    name: 'messageReactionRemoveAll',
    async execute(message, removedReactions) {
        // console.log(`messageReactionRemoveAll: ${message.content}, ${message.author}.`);

        // Fetch any partials
        if (message.partial) {
            message = await message.fetch().catch(console.error)
        }

        const implies = (p, q) => {
            // p -> q
            if (p) {
                return q;
            } else {
                return true;
            }
        }


        try {
            removedReactions.each(reaction => {
                // console.log(reaction.count, reaction.emoji.id, reaction)
                reaction.users.cache.each(user => {
                    if (message.author.id !== message.client.user.id) {             // Read messages from anyone other than bot
                        if (getSetting(message.guild.id, 'countreacts')) {  // Count reacts
                            let guildId = message.guild.id
                            let reactionAuthorId = user.id
                            let messageAuthorId = messageReaction.message.author.id
                            let dateTime = message.createdAt.toISOString()

                            // Dont pass if message author is reaction user AND countselfreacts flag is false
                            if (
                                implies(
                                    (message.author.id === user.id),
                                    getSetting(message.guild.id, 'countselfreacts')
                                )
                            ) {
                                if (reaction.emoji.id) {  // if not unicode emoji
                                    message.guild.emojis
                                        .fetch(reaction.emoji.id)
                                        .then(emoji => {
                                            // console.log(emoji)
                                            deleteFromDb(guildId, emoji.id, reactionAuthorId, dateTime, 'reactsSentActivity', "messageReactionRemoveAll")
                                            deleteFromDb(guildId, emoji.id, messageAuthorId, dateTime, 'reactsReceivedActivity', "messageReactionRemoveAll")
                                        })
                                        .catch(ignoreError => {
                                            // Ignores failed fetches (As failed fetches means the emoji is not a guild emoji)
                                        })
                                }
                            }
                        }
                    }
                })

            })
        } catch (e) {
            console.error(e)
        }

    },
};