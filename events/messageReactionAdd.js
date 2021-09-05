module.exports = {
    name: 'messageReactionAdd',
    execute(messageReaction, user) {
        console.log(`messageReactionAdd -> ${messageReaction.message}, ${messageReaction.emoji}, ${user}.`);
    },
};