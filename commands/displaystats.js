const {SlashCommandBuilder} = require('@discordjs/builders');

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
                    ['Yearly', 365],
                    ['Monthly', 30],
                    ['Weekly', 7],
                ]))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to query for. Not specifying grabs entire server\'s statistics.')),
    async execute(interaction) {
        const date_range = interaction.options.getInteger('daterange');
        const user = interaction.options.getUser('user');
        return interaction.reply(`display stats WIP... ${date_range}, ${user}`);
    },
};
