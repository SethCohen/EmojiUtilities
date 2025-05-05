import { Events } from 'discord.js';
import { sendErrorFeedback, createSupportMessage } from '../helpers/utilities.js';

const userCommandCounts = new Map();

function incrementUserCount(userId) {
  const entry = userCommandCounts.get(userId) || { count: 0, timeout: null };

  if (entry.timeout) clearTimeout(entry.timeout);

  entry.count += 1;

  entry.timeout = setTimeout(() => {
    userCommandCounts.delete(userId);
  }, 60 * 60 * 1000);

  userCommandCounts.set(userId, entry);
  return entry.count;
}

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);

      const count = incrementUserCount(interaction.user.id);
      console.log(`User ${interaction.user.tag} (${interaction.user.id}) executed command "${interaction.commandName}". Count: ${count}`);

      if (count === 1 || (count > 1 && count % 7 === 0)) {
        setTimeout(async () => {
          const supportEmbed = createSupportMessage(interaction.client);
          await interaction.followUp({
            embeds: [supportEmbed],
            ephemeral: true,
          });
        }, 30000);
      }

    } catch (error) {
      console.error(`Error running command "${interaction.commandName}":\n`, error);

      const errorMessage =
        error.message === "Cannot read properties of null (reading '1')"
          ? 'No emoji found in `emoji`.'
          : undefined;

      const replyData = {
        embeds: [sendErrorFeedback(interaction.commandName, errorMessage)],
        ephemeral: true,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(replyData);
      } else {
        await interaction.reply(replyData);
      }
    }
  },
};
