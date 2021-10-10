const {insertToDb} = require("../db_model");
const {getSetting} = require("../db_model");

module.exports = {
    name: 'messageReactionAdd',
    async execute(messageReaction, user) {
        // console.log(`messageReactionAdd: ${messageReaction.message}, ${messageReaction.emoji}, ${user}.`);

        // Fetch any partials
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

        try {
            if (messageReaction.message.author.id !== messageReaction.client.user.id) {     // Read messages from anyone other than bot
                if (getSetting(messageReaction.message.guild.id, 'countreacts')) {   // Count reacts
                    let guildId = messageReaction.message.guild.id
                    let reactionAuthorId = user.id
                    let messageAuthorId = messageReaction.message.author.id
                    let dateTime = messageReaction.message.createdAt.toISOString()

                    // Dont pass if message author is reaction user AND countselfreacts flag is false
                    if (
                        implies(
                            (messageReaction.message.author.id === user.id),
                            getSetting(messageReaction.message.guild.id, 'countselfreacts')
                        )
                    ) {
                        if (messageReaction.emoji.id) {  // if not unicode emoji
                            messageReaction.message.guild.emojis
                                .fetch(messageReaction.emoji.id)
                                .then(emoji => {
                                    // console.log(emoji)
                                    insertToDb(guildId, emoji.id, reactionAuthorId, dateTime, 'reactsSentActivity', "messageReactionAdd")
                                    insertToDb(guildId, emoji.id, messageAuthorId, dateTime, 'reactsReceivedActivity', "messageReactionAdd")
                                })
                        }
                    }
                }
            }
        } catch (e) {
            console.error(e)
        }

    },
};