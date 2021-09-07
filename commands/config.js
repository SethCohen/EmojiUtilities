const {setSetting} = require("../db_model");
const {SlashCommandBuilder} = require('@discordjs/builders');
const {Permissions} = require('discord.js');

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
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('countselfreacts')
                .setDescription('Allows bot to count self reacts on self messages. Default: true')
                .addBooleanOption(option =>
                    option.setName('flag')
                        .setDescription("Set flag")
                        .setRequired(true))),
    async execute(interaction) {
        if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
            return interaction.reply({
                content: "You do not have enough permissions to use this command.",
                ephemeral: true
            })

        const setting = interaction.options.getSubcommand()
        const flag = interaction.options.getBoolean('flag') ? 1 : 0

        setSetting(interaction.guild.id, setting, flag)

        return interaction.reply({content: `Setting \`${setting}\` set to \`${Boolean(flag)}\`.`, ephemeral: true});
    },
};
