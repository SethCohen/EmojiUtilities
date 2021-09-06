const {getSettingFlag} = require('../db_model')

module.exports = {
    name: 'messageCreate',
    execute(message) {
        if (message.author.id !== message.client.user.id) {
            console.log(`messageCreate -> ${message.content} from ${message.author}.`);
            if(getSettingFlag(message.guild.id, 'countmessages')){
                /* TODO
                    # Reads emojis in message
                    emojis = re.findall(r'<:\w*:\d*>|<a:\w*:\d*>', message.content)  # Finds all emojis in message
                    # print('Detected emojis in message', message.id, ':', emojis)
                    for str_emoji in emojis:
                        for emoji in message.guild.emojis:
                            if str_emoji == str(emoji):
                                emoji = str(emoji.id)
                                insert_to_db(message, emoji)
                */
            }
        }
    },
};