const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Displays the top ten users for a specified emote\'s usage')
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('The emoji to get the leaderboard for.')
                .setRequired(true)),
    async execute(interaction) {
        const emoji = interaction.options.getString('emoji');
        return interaction.reply(`leaderboard WIP... ${emoji}`);
    },
};
