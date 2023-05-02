import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import { confirmationButtons, sendErrorFeedback } from '../helpers/utilities.js';
import { resetDb } from '../helpers/mongodbModel.js';

export default {
  data: new SlashCommandBuilder().setName('resetdb').setDescription('Clears your server\'s databases.'),
  async execute(interactionCommand) {
    await interactionCommand.deferReply({ ephemeral: true });

    if (!interactionCommand.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interactionCommand.reply({
        content: 'You do not have enough permissions to use this command.\nRequires **Administrator**.',
        ephemeral: true,
      });
    }

    await interactionCommand.editReply({
      content:
        'Are you sure you want to reset your server\'s database?\nThis is a permanent decision. There is no undoing this action.',
      components: [confirmationButtons(true)],
    });

    // Create button listeners
    const message = await interactionCommand.fetchReply();
    const filter = async (i) => {
      await i.deferUpdate();
      if (i.user.id !== interactionCommand.user.id) {
        await i.followUp({
          content: 'You can\'t interact with this button. You are not the command author.',
          ephemeral: true,
        });
      }
      return i.user.id === interactionCommand.user.id;
    };
    message
      .awaitMessageComponent({ filter, time: 30000 })
      .then(async (interactionButton) => {
        if (interactionButton.customId === 'confirm') {
          await resetDb(interactionCommand.client.db, interactionCommand.guild.id);
          await interactionButton.followUp({
            content: 'Database reset!',
            ephemeral: true,
          });
        }
        else if (interactionButton.customId === 'cancel') {
          await interactionButton.followUp({
            content: 'Canceled reset.',
            ephemeral: true,
          });
        }
      })
      .catch(async (error) => {
        switch (error.message) {
          case 'Unknown Message':
            // Ignore unknown interactions (Often caused from deleted interactions).
            break;
          case 'Collector received no interactions before ending with reason: time':
            await interactionCommand.followUp({
              content: 'User took too long. Interaction timed out.',
            });
            break;
          default:
            console.error(`Command:\n${interactionCommand.commandName}\nError Message:\n${error.message}`);
            return await interactionCommand.followUp({
              embeds: [sendErrorFeedback(interactionCommand.commandName)],
            });
        }
      })
      .finally(async () => {
        await interactionCommand.editReply({
          components: [confirmationButtons(false)],
        });
      });
  },
};
