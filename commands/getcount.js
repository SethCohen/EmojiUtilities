const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getcount')
        .setDescription('Displays the total emote usage to chat.')
        .addUserOption(option =>
            option.setName('user').setDescription('The user to get total emote usage stats for.')),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        return interaction.reply(`get count WIP... ${user}`);
    },
};
