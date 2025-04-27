import { Events } from 'discord.js';
import { sendErrorFeedback } from '../helpers/utilities.js';

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error running command "${interaction.commandName}":\n`, error);

      const errorMessage = 
        error.message === "Cannot read properties of null (reading '1')" 
          ? 'No emoji found in `emoji`.'
          : undefined;

      // Always check if a reply was already sent
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          embeds: [sendErrorFeedback(interaction.commandName, errorMessage)],
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          embeds: [sendErrorFeedback(interaction.commandName, errorMessage)],
          ephemeral: true,
        });
      }
    }
  },
};
