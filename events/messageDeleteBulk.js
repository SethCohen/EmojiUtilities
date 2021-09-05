module.exports = {
    name: 'messageDeleteBulk',
    execute(messages) {
        let i = 0
        messages.every(message => {
            console.log(`messageDeleteBulk#${i++} -> ${message.content} from ${message.author}.`);
        })
    },
};