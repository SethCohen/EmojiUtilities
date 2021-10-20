const {Permissions} = require("discord.js");
const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('enlargeemoji')
        .setDescription('Pastes the emoji\'s url to chat.')
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('The emoji to display.')
                .setRequired(true)
        ),
    async execute(interaction) {
        // Validates emoji option.
        const stringEmoji = interaction.options.getString('emoji');
        let re = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/
        let emoji = stringEmoji.match(re)
        try {
            emoji = await interaction.guild.emojis.fetch(emoji[3])
        } catch {
            return interaction.reply({content: 'No custom emoji found in string.', ephemeral: true})
        }

        // Sends emoji to chat.
        if (emoji) {
            return interaction.reply({content: `${emoji.url}`})
        }

    },
};
