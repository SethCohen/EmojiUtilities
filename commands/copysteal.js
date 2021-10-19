const {Permissions} = require("discord.js");
const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('copysteal')
        .setDescription('Steals a custom emoji and uploads it to your server.')
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('The custom emoji to steal.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Name for the copied emoji')),
    execute(interaction) {
        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS))
            return interaction.reply({
                content: "You do not have enough permissions to use this command.\nYou need Manage Emojis perms to use this command.",
                ephemeral: true
            })

        const stringEmoji = interaction.options.getString('emoji');
        const name = interaction.options.getString('name')

        let re = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/
        let emoji = stringEmoji.match(re)

        if (emoji) {
            let url;
            if (emoji[1]) {
                url = `https://cdn.discordapp.com/emojis/${emoji[3]}.gif`
            } else {
                url = `https://cdn.discordapp.com/emojis/${emoji[3]}.png`
            }

            interaction.guild.emojis
                .create(url, name ? name : emoji[2])
                .then(emoji => {
                    return interaction.reply({content: `Added ${emoji} to server!`})
                })
                .catch(e => {
                    return interaction.reply({content: `Emoji creation failed!\n${e.message}`})
                })
        } else {
            return interaction.reply({
                content: "No custom emoji was found in your message!",
                ephemeral: true
            })

        }


    },
};
