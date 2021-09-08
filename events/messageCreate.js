const {insertToDb} = require("../db_model");
const {getSetting} = require('../db_model')

module.exports = {
    name: 'messageCreate',
    execute(message) {
        if (message.author.id !== message.client.user.id) {

            if (message.content.substring(0, 2) === 'ES') {
                message.reply('Hey! Sorry for the inconvenience! We\'ve recently converted the bot completely to slash' +
                    ' commands (Check it out with `/help`!) to comply with Discord\'s upcoming changes.' +
                    '\nYou can find out more about those changes at ' +
                    '<https://support-dev.discord.com/hc/en-us/articles/4404772028055-Message-Content-Access-Deprecation-for-Verified-Bots>'+
                    '\nAlso, this update was quite a big update so if you notice any bugs, please report' +
                    ' them in our Support Server: https://discord.gg/XaeERFAVfb' +
                    '\nThe server is also a good way to keep up to date with bot changelogs or make feature requests.' +
                    '\n\n**YOU HAVE TO RE-AUTH THE BOT FOR SLASH COMMAND ACCESS! Please re-auth the bot by clicking:** ' +
                    '\nhttps://discord.com/api/oauth2/authorize?client_id=757326308547100712&permissions=93248&scope=applications.commands%20bot')
            }

            // console.log(`messageCreate: ${message.content}, ${message.author}.`);
            if (getSetting(message.guild.id, 'countmessages')) {
                let guildId = message.guild.id
                let personId = message.author.id
                let dateTime = message.createdAt.toISOString().split('T')[0]

                let re = /(?<=:)\d*(?=>)/g
                let emojiIds = message.content.matchAll(re)
                for (const emojiId of emojiIds) {
                    message.guild.emojis
                        .fetch(emojiId)
                        .then(emoji => insertToDb(guildId, emoji.id, personId, dateTime, "messageCreate"))
                        .catch(() => {
                        })
                }
            }
        }
    },
};