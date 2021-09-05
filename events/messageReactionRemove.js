module.exports = {
    name: 'messageReactionRemove',
    execute(messageReaction, user) {
        console.log(`messageReactionRemove -> ${messageReaction.message}, ${messageReaction.emoji}, ${user}.`);
    },
};