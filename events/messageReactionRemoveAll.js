module.exports = {
    name: 'messageReactionRemoveAll',
    execute(message) {
        console.log(`messageReactionRemoveAll -> ${message.content}, ${message.author}.`);
    },
};