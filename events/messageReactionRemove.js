const {deleteFromDb} = require("../db_model");
const {getSetting} = require("../db_model");

module.exports = {
    name: 'messageReactionRemove',
    async execute(messageReaction, user) {
        // console.log(`messageReactionRemove: ${messageReaction.message}, ${messageReaction.emoji}, ${user}.`);
        if (messageReaction.partial) {
            messageReaction = await messageReaction.fetch().catch(console.error)
        }

        const implies = (p, q) => {
            // p -> q
            if (p) {
                return q;
            } else {
                return true;
            }
        }

        if (messageReaction.message.author.id !== messageReaction.client.user.id) {
            if (getSetting(messageReaction.message.guild.id, 'countreacts')) {
                let guildId = messageReaction.message.guild.id
                let personId = messageReaction.message.author.id
                let dateTime = messageReaction.message.createdAt.toISOString()

                if (
                    implies(
                        (messageReaction.message.author.id === user.id),
                        getSetting(messageReaction.message.guild.id, 'countselfreacts')
                    )
                ) {
                    if (messageReaction.emoji.id) {  // if not unicode emoji
                        messageReaction.message.guild.emojis
                            .fetch(messageReaction.emoji.id)
                            .then(emoji => deleteFromDb(guildId, emoji.id, personId, dateTime, "messageReactionRemove"))
                            .catch(() => {
                            })
                    }
                }
            }
        }
    },
};