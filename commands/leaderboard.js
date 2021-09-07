const {getLeaderboard} = require("../db_model");
const {MessageButton} = require("discord.js");
const {MessageActionRow} = require("discord.js");
const {MessageEmbed} = require("discord.js");
const {SlashCommandBuilder} = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Displays the top ten users for a specified emote\'s usage')
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('The emoji to get the leaderboard for.')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('daterange')
                .setDescription('The date range to query for.')
                .addChoices([
                    ['All Time', 0],
                    ['Monthly', 30],
                    ['Weekly', 7],
                ])),
    async execute(interaction) {
        const embed = new MessageEmbed().setColor('ORANGE')

        const stringEmoji = interaction.options.getString('emoji');

        // Validate choices
        let dateRange = interaction.options.getInteger('daterange');
        switch (dateRange) {
            case 0:
                // all time
                embed.setDescription("All Time")
                dateRange = '0'
                break
            case 30:
                // monthly
                embed.setDescription("Monthly")
                dateRange = new Date()
                dateRange.setMonth(dateRange.getMonth() - 1)
                dateRange = dateRange.toISOString()
                break
            case 7:
                // weekly
                embed.setDescription("Weekly")
                dateRange = new Date()
                dateRange.setDate(dateRange.getDate() - 7)
                dateRange = dateRange.toISOString()
                break
            default:
                dateRange = null
        }

        let re = /(?<=:)\d*(?=>)/g
        let emojiIds = stringEmoji.match(re)

        let emoji = null
        try {
            emoji =  await interaction.guild.emojis.fetch(emojiIds[0])
        } catch {
            return interaction.reply({content: 'No emoji found in string.', ephemeral: true})
        }
        embed.setTitle(`${emoji.name} Leaderboard`).setThumbnail(`${emoji.url}`)

        let array = (dateRange ?
            getLeaderboard(interaction.guild.id, emoji.id, interaction.client.id, dateRange) :
            getLeaderboard(interaction.guild.id, emoji.id, interaction.client.id))
        let pos = 1

        for await (const row of array) {
            let count = Object.values(row)[1]
            let userId = Object.values(row)[0]
            let user = await interaction.guild.members.fetch(userId)
            embed.addField(`${pos}. ${user.displayName}`, `${count}`)
            pos++
        }
        return interaction.reply({embeds: [embed]})
    },
};
