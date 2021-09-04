const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Change various bot functionalities.')
        .addSubcommand(subcommand =>
            subcommand.setName('countmessages')
                .setDescription('Allows bot to count reactions. Default: true')
                .addBooleanOption(option =>
                    option.setName('flag')
                        .setDescription("Set flag")
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('countreacts')
                .setDescription('Allows bot to count messages. Default: true')
                .addBooleanOption(option =>
                    option.setName('flag')
                        .setDescription("Set flag")
                        .setRequired(true))),
    async execute(interaction) {
        return interaction.reply({content: `config WIP...`, ephemeral: true});
    },
};
