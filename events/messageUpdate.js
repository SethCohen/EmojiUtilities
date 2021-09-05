module.exports = {
    name: 'messageUpdate',
    execute(oldMessage, newMessage) {
        console.log(`messageUpdate -> ${oldMessage.content}, ${oldMessage.author} -> ${newMessage.content}, ${newMessage.author}.`);
    },
};