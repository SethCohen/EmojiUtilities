module.exports = {
    name: 'messageCreate',
    execute(message) {
        console.log(`messageCreate -> ${message.content} from ${message.author}.`);
    },
};