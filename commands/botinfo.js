const {MessageEmbed} = require("discord.js");
const {SlashCommandBuilder, hyperlink} = require('@discordjs/builders');
const ms = require("ms");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Displays info about the bot.'),
    execute(interaction) {
        let guildsCount = interaction.client.guilds.cache.size
        let uptime = interaction.client.uptime


        const embed = new MessageEmbed().setColor('ORANGE')
        embed.setTitle(`${interaction.client.user.username}`)
            .setThumbnail(`${interaction.client.user.avatarURL()}`)
            .addFields(
                {name: 'Guilds:', value: guildsCount.toString(), inline: true},
                {name: 'Uptime:', value: ms(uptime), inline: true},
            )
            .setDescription(hyperlink('Vote for Emoji Utilities!', 'https://top.gg/bot/757326308547100712'))
        // TODO add shards count when shards are implemented.
        // TODO add total emoji counts

        return interaction.reply({embeds: [embed]})

    },
};
