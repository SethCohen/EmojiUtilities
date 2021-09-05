const {SlashCommandBuilder} = require('@discordjs/builders');

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
                    ['Yearly', 365],
                    ['Monthly', 30],
                    ['Weekly', 7],
                ])),
    async execute(interaction) {
        const emoji = interaction.options.getString('emoji');
        return interaction.reply(`leaderboard WIP... ${emoji}`);
    },
};
