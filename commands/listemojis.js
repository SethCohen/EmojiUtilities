const {SlashCommandBuilder} = require('@discordjs/builders');
const {MessageActionRow, MessageButton} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listemojis')
        .setDescription('Displays all usable emotes to chat.'),
    async execute(interaction) {
        await interaction.deferReply();

        // Initializes Buttons
        const enabledRow = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('prev')
                    .setLabel('👈 Prev')
                    .setStyle('SECONDARY'),
                new MessageButton()
                    .setCustomId('next')
                    .setLabel('👉 Next')
                    .setStyle('SECONDARY'),
            );
        const disabledRow = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('prev')
                    .setLabel('👈 Prev')
                    .setStyle('SECONDARY')
                    .setDisabled(true),
                new MessageButton()
                    .setCustomId('next')
                    .setLabel('👉 Next')
                    .setStyle('SECONDARY')
                    .setDisabled(true),
            );

        // Paginates emojis
        const emojisList = [...interaction.guild.emojis.cache.map(emoji => emoji.toString()).values()]
        let chunkSize = 27;
        let chunks = []
        let index = 0
        for (let i = 0, j = emojisList.length; i < j; i += chunkSize) {
            let chunk = emojisList.slice(i, i + chunkSize).join(' ');
            chunks.push(chunk)
        }
        chunks.push(`This server has a total of ${emojisList.length} emojis.`)

        // Displays emojis
        await interaction.editReply({content: chunks[index], components: [enabledRow]})

        // Adds button listeners
        const message = await interaction.fetchReply()
        const collector = message.createMessageComponentCollector({time: 30000});
        collector.on('collect', async i => {
            if (i.customId === 'next' && index < chunks.length - 1) {
                ++index
                await i.update({content: chunks[index]});
            } else if (i.customId === 'prev' && index > 0) {
                --index
                await i.update({content: chunks[index]});
            } else {
                await i.reply({content: "No valid page to go to.", ephemeral: true})
            }
        });
        collector.on('end', collected => {
            interaction.editReply({components: [disabledRow]})
            // console.log(`Collected ${collected.size} interactions.`);
        });
    },
};
