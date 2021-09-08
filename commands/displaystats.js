const {MessageButton} = require("discord.js");
const {MessageActionRow} = require("discord.js");
const {getDisplayStats} = require("../db_model");
const {MessageEmbed} = require("discord.js");
const {SlashCommandBuilder} = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('displaystats')
        .setDescription('Displays all emote usages to chat.')
        .addIntegerOption(option =>
            option.setName('daterange')
                .setDescription('The date range to query for.')
                .setRequired(true)
                .addChoices([
                    ['All Time', 0],
                    ['Monthly', 30],
                    ['Weekly', 7],
                ]))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to query for. Not specifying grabs entire server\'s statistics.')),
    async execute(interaction) {
        await interaction.deferReply();

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('prev')
                    .setLabel('👈Prev')
                    .setStyle('SECONDARY'),
                new MessageButton()
                    .setCustomId('next')
                    .setLabel('👉 Next')
                    .setStyle('SECONDARY'),
            );


        const user = interaction.options.getUser('user');

        let dateRange = interaction.options.getInteger('daterange');
        let dateString
        switch (dateRange) {
            case 0:
                // all time
                dateString = "All-Time"
                dateRange = '0'
                break
            case 30:
                // monthly
                dateString = "Monthly"
                dateRange = new Date()
                dateRange.setMonth(dateRange.getMonth() - 1)
                dateRange = dateRange.toISOString()
                break
            case 7:
                // weekly
                dateString = "Weekly"
                dateRange = new Date()
                dateRange.setDate(dateRange.getDate() - 7)
                dateRange = dateRange.toISOString()
                break
            default:
                dateString = 'All-Time'
                dateRange = '0'
        }

        let array = (user ?
            getDisplayStats(interaction.guild.id, dateRange, user.id) :
            getDisplayStats(interaction.guild.id, dateRange))

        let chunkSize = 24;
        let embeds = []
        let chunks = []
        let index = 0
        let pageNumber = 1
        for (let i = 0, j = array.length; i < j; i += chunkSize) {
            let chunk = array.slice(i, i + chunkSize);
            chunks.push(chunk)

        }
        for (const chunk of chunks) {
            const embed = new MessageEmbed()
                .setColor('ORANGE')
                .setTitle(`---------- ${user ? user.username : 'Server'}'s Statistics ----------`)
                .setDescription(dateString)
                .setFooter(`Page ${pageNumber++}/${chunks.length}`)
            for await (const row of chunk) {
                let count = Object.values(row)[1]
                let emojiId = Object.values(row)[0]
                let emoji = await interaction.guild.emojis.fetch(emojiId)
                embed.addField(`${emoji}`, `${count}`, true)
            }
            embeds.push(embed)
        }

        await interaction.editReply({embeds: [embeds[index]], components: [row]});

        const message = await interaction.fetchReply()
        const collector = message.createMessageComponentCollector({time: 30000});

        // console.log(embeds.length, "length")

        collector.on('collect', async i => {
            if (i.customId === 'next' && index < embeds.length - 1) {
                ++index
                await i.update({embeds: [embeds[index]]});
            } else if (i.customId === 'prev' && index > 0) {
                --index
                await i.update({embeds: [embeds[index]]});
            } else {
                await i.reply({content: "No valid page to go to.", ephemeral: true})
            }
        });

        collector.on('end', collected => {
            interaction.editReply({components: []})
            // console.log(`Collected ${collected.size} interactions.`);
        });

    },
};
