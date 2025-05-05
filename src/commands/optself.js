import { EmbedBuilder, SlashCommandBuilder, MessageFlags } from 'discord.js';
import { setOpt, clearUserFromDb } from '../helpers/mongodbModel.js';
import { confirmationButtons, sendErrorFeedback } from '../helpers/utilities.js';

export default {
  data: new SlashCommandBuilder()
    .setName('optself')
    .setDescription('Opts the command user in or out of emoji usage logging.')
    .addStringOption(option =>
      option.setName('flag')
        .setDescription('Whether to opt-in or opt-out')
        .addChoices(
          { name: 'Opt-in', value: 'true' },
          { name: 'Opt-out', value: 'false' }
        )
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const flag = interaction.options.getString('flag');

    const embed = new EmbedBuilder()
      .setTitle(`Are you sure you want to opt-${flag === 'true' ? 'in' : 'out'} of your server's database?`)
      .setDescription(
        flag === 'true'
          ? 'Opting in will allow the bot to record your emoji usage again.'
          : "Opting out will both disallow that AND **clear all previous records of your emoji usage from your server's database immediately.**\nThis is a permanent decision. There is no undoing this action."
      );

    await interaction.editReply({
      embeds: [embed],
      components: [confirmationButtons(true)],
    });

    const message = await interaction.fetchReply();

    const filter = (i) => {
      if (i.user.id !== interaction.user.id) {
        i.reply({
          content: "You can't interact with this button. You are not the command author.",
          flags: MessageFlags.Ephemeral,
        }).catch(() => {});
        return false;
      }
      return true;
    };

    try {
      const button = await message.awaitMessageComponent({ filter, time: 30000 });
      await button.deferUpdate();

      if (button.customId === 'confirm') {
        await setOpt(interaction.client.db, interaction.guildId, interaction.member.id, flag === 'true');

        await button.followUp({
          content: `You have opted-${flag === 'true' ? 'in' : 'out'}. Take care!`,
          flags: MessageFlags.Ephemeral,
        });

        if (flag !== 'true') {
          await clearUserFromDb(interaction.client.db, interaction.guildId, interaction.member.id);
        }

      } else if (button.customId === 'cancel') {
        await button.followUp({
          content: `Canceled opt-${flag === 'true' ? 'in' : 'out'}.`,
          flags: MessageFlags.Ephemeral,
        });
      }

      await interaction.editReply({
        components: [confirmationButtons(false)],
      });

    } catch (error) {
      const errMsg = error.message || '';

      if (errMsg.includes('Unknown Message')) {
        // Ignore deleted interactions
      } else if (errMsg.includes('time')) {
        await interaction.editReply({
          content: 'User took too long. Interaction timed out.',
          embeds: [embed],
          components: [],
        });
      } else {
        console.error(`Command:\n${interaction.commandName}\nError:\n${error.stack}`);
        await interaction.editReply({
          embeds: [sendErrorFeedback(interaction.commandName)],
          components: [],
        });
      }
    }
  },
};
