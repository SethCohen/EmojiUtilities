import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField, MessageFlags } from 'discord.js';
import { sendErrorFeedback } from '../helpers/utilities.js';
import { setSetting } from '../helpers/mongodbModel.js';
import { mediaLinks } from '../helpers/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Change various bot functionalities.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('countmessages')
        .setDescription('Allows bot to count messages. Default: true')
        .addBooleanOption(option =>
          option.setName('flag').setDescription('Set flag').setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('countreacts')
        .setDescription('Allows bot to count reactions. Default: true')
        .addBooleanOption(option =>
          option.setName('flag').setDescription('Set flag').setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('countselfreacts')
        .setDescription('Allows bot to count self reacts on self messages. Default: true')
        .addBooleanOption(option =>
          option.setName('flag').setDescription('Set flag').setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('allownsfw')
        .setDescription('Allows NSFW images in emoji.gg commands. Default: false')
        .addBooleanOption(option =>
          option.setName('flag').setDescription('Set flag').setRequired(true)
        )
    ),
    
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await interaction.editReply({
        content: 'You do not have enough permissions to use this command.\nRequires **Administrator**.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      const setting = interaction.options.getSubcommand();
      const flag = interaction.options.getBoolean('flag');

      const embedSuccess = new EmbedBuilder()
        .setTitle(`\`${setting}\` set to \`${flag}\`.`)
        .setDescription(`If you've enjoyed this bot so far, please consider voting for it.\nIt helps the bot grow. 🙂\n${mediaLinks}`);

      await setSetting(interaction.client.db, interaction.guild.id, setting, flag);
      await interaction.editReply({ embeds: [embedSuccess] });

    } catch (error) {
      if (error.message.includes('Bots cannot use this endpoint')) {
        await interaction.editReply({
          embeds: [
            sendErrorFeedback(
              interaction.commandName,
              'Discord recently updated their API, disabling the ability for bots to set command permissions.\nHopefully their new system is updated to re-allow this ability, but in the meantime, you can toggle commands yourself via:\n`Server Settings -> Integrations -> Emoji Utilities -> Manage`'
            ),
          ],
        });
      } else {
        console.error(`Command:\n${interaction.commandName}\nError:\n${error.stack}\nRaw Input:\n${interaction.options.getSubcommand()} ${interaction.options.getBoolean('flag')}`);
        await interaction.editReply({
          embeds: [sendErrorFeedback(interaction.commandName)],
        });
      }
    }
  },
};
