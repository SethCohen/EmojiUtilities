module.exports = {
    name: 'messageDelete',
    execute(message) {
        console.log(`messageDelete -> ${message.content}, ${message.author}.`);
    },
};