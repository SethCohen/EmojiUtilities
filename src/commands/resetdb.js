import { SlashCommandBuilder, PermissionsBitField, MessageFlags } from 'discord.js';
import { confirmationButtons, sendErrorFeedback } from '../helpers/utilities.js';
import { resetDb } from '../helpers/mongodbModel.js';

export default {
  data: new SlashCommandBuilder()
    .setName('resetdb')
    .setDescription("Clears your server's databases."),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.editReply({
        content: 'You do not have enough permissions to use this command.\nRequires **Administrator**.',
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.editReply({
      content: "Are you sure you want to reset your server's database?\nThis is a permanent decision. There is no undoing this action.",
      components: [confirmationButtons(true)],
      flags: MessageFlags.Ephemeral,
    });

    const message = await interaction.fetchReply();

    const filter = async (i) => {
      if (i.user.id !== interaction.user.id) {
        await i.reply({ 
          content: "You can't interact with this button. You are not the command author.", 
          flags: MessageFlags.Ephemeral 
        });
        return false;
      }
      await i.deferUpdate();
      return true;
    };

    try {
      const firstInteraction = await message.awaitMessageComponent({ filter, time: 30_000 });

      if (firstInteraction.customId === 'cancel') {
        await interaction.followUp({ 
          content: 'Canceled reset.', 
          flags: MessageFlags.Ephemeral 
        });
        return await interaction.editReply({ components: [confirmationButtons(false)], flags: MessageFlags.Ephemeral });
      }

      // Step 2: Double confirmation
      await interaction.editReply({
        content: "⚠️ **Final Warning** ⚠️\nAre you absolutely sure you want to reset the database?\nThis cannot be undone.",
        components: [confirmationButtons(true)],
        flags: MessageFlags.Ephemeral,
      });

      const secondMessage = await interaction.fetchReply();
      const secondInteraction = await secondMessage.awaitMessageComponent({ filter, time: 30_000 });

      if (secondInteraction.customId === 'confirm') {
        await resetDb(interaction.client.db, interaction.guild.id);
        await secondInteraction.followUp({ 
          content: '✅ Database reset!', 
          flags: MessageFlags.Ephemeral 
        });
      } else if (secondInteraction.customId === 'cancel') {
        await secondInteraction.followUp({ 
          content: 'Canceled at final confirmation.', 
          flags: MessageFlags.Ephemeral 
        });
      }
    } catch (error) {
      if (error.message === 'Collector received no interactions before ending with reason: time') {
        await interaction.followUp({ 
          content: 'User took too long. Interaction timed out.', 
          flags: MessageFlags.Ephemeral 
        });
      } else if (error.message !== 'Unknown Message') {
        console.error(`Command: ${interaction.commandName}\nError: ${error}`);
        await interaction.followUp({ 
          embeds: [sendErrorFeedback(interaction.commandName)], 
          flags: MessageFlags.Ephemeral 
        });
      }
    } finally {
      await interaction.editReply({ 
        components: [confirmationButtons(false)],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
