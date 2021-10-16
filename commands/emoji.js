const {getEmojiTotalCount} = require("../db_model");
const {MessageEmbed} = require("discord.js");
const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emoji')
        .setDescription('Displays generic information about an emoji.')
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('The emoji to get info for.')
                .setRequired(true)),
    async execute(interaction) {
        const embed = new MessageEmbed().setColor('ORANGE')

        // Validates emoji option.
        const stringEmoji = interaction.options.getString('emoji');
        let re = /(?<=:)\d*(?=>)/g
        let emojiIds = stringEmoji.match(re)
        let emoji = null
        try {
            emoji = await interaction.guild.emojis.fetch(emojiIds[0])
        } catch {
            return interaction.reply({content: 'No emoji found in string.', ephemeral: true})
        }

        // Fetches content
        let author = await emoji.fetchAuthor()
        let count = getEmojiTotalCount(interaction.guild.id, emoji.id)

        // Fills embed.
        embed.setTitle(`${emoji.name}`).setThumbnail(`${emoji.url}`)
        embed.addFields(
            {name: 'Author:', value: author.toString()},
            {name: 'Date Added:', value: emoji.createdAt.toString()},
            {name: 'Total Times Used:', value: count.toString()}
        )

        return interaction.reply({embeds: [embed]})
    },
};
