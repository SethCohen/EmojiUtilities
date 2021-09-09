// customly modified MessageReactionRemoveAll.js from discord.js module

const {deleteFromDb} = require("../db_model");
const {getSetting} = require("../db_model");
module.exports = {
    name: 'messageReactionRemoveAll',
    async execute(message, removedReactions) {
        // console.log(`messageReactionRemoveAll: ${message.content}, ${message.author}.`);
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

        removedReactions.each(reaction => {
            // console.log(reaction.count, reaction.emoji.id, reaction)
            reaction.users.cache.each(user => {
                if (message.author.id !== message.client.user.id) {
                    if (getSetting(message.guild.id, 'countreacts')) {
                        let guildId = message.guild.id
                        let personId = message.author.id
                        let dateTime = message.createdAt.toISOString()

                        if (
                            implies(
                                (message.author.id === user.id),
                                getSetting(message.guild.id, 'countselfreacts')
                            )
                        ) {
                            if (reaction.emoji.id) {  // if not unicode emoji
                                message.guild.emojis
                                    .fetch(reaction.emoji.id)
                                    .then(emoji => deleteFromDb(guildId, emoji.id, personId, dateTime, "messageReactionRemoveAll"))
                                    .catch(() => {
                                    })
                            }
                        }
                    }
                }
            })

        })
    },
};