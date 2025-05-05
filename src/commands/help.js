import { EmbedBuilder, SlashCommandBuilder, MessageFlags } from 'discord.js';
import { mediaLinks } from '../helpers/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Prints a list of useful bot-related resources to chat.'),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const embed = new EmbedBuilder()
      .setTitle('Help')
      .setDescription(
        `${mediaLinks} | [FAQ](https://github.com/SethCohen/EmojiUtilities/wiki#frequently-asked-questions) | [Wiki](https://github.com/SethCohen/EmojiUtilities/wiki)`
      )
      .setFooter({ text: 'Thanks for using EmojiUtilities!' });

    await interaction.editReply({ embeds: [embed] });
  },
};
