import { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } from 'discord.js';
import { confirmationButtons, sendErrorFeedback } from '../helpers/utilities.js';
import { getDisplayStats } from '../helpers/mongodbModel.js';

export default {
  data: new SlashCommandBuilder()
    .setName('removeunused')
    .setDescription('Removes one or more of the least used emojis.')
    .addIntegerOption(option =>
      option.setName('number').setDescription('How many emojis to remove. Default: 1')
    ),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      if (!hasEmojiManagePermission(interaction.member)) {
        return await replyNoPermission(interaction);
      }

      const number = interaction.options.getInteger('number') ?? 1;
      const emojisToRemove = await findLeastUsedEmojis(interaction, number);

      if (emojisToRemove.length === 0) {
        return await interaction.editReply({ content: 'No removable emojis found.' });
      }

      await showEmojisToRemove(interaction, emojisToRemove);
      await handleUserInteraction(interaction, emojisToRemove);

    } catch (error) {
      await handleExecuteError(error, interaction);
    }
  },
};

// --- Helper Functions ---

function hasEmojiManagePermission(member) {
  return member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers);
}

async function replyNoPermission(interaction) {
  return interaction.reply({
    content: 'You do not have enough permissions to use this command.\nRequires **Manage Emojis**.',
    ephemeral: true,
  });
}

async function findLeastUsedEmojis(interaction, number) {
  const occurrences = await getDisplayStats(interaction.client.db, interaction.guild.id, '0');

  const usageList = interaction.guild.emojis.cache
    .filter(emoji => !emoji.managed) // 🛡️ Filter out managed emojis
    .map(emoji => {
      const usage = occurrences.find(row => row.emoji === emoji.id);
      return {
        emoji,
        count: usage ? usage['COUNT(emoji)'] : 0,
      };
    })
    .sort((a, b) => b.count - a.count) // Descending: most used → least used
    .splice(-number);                  // Take last N (least used)

  return usageList.map(entry => entry.emoji);
}

async function showEmojisToRemove(interaction, emojis) {
  const emojiList = emojis.map(e => e.toString()).join(' ');
  await interaction.editReply({
    content: `Emojis selected for removal: ${emojiList}`,
    components: [confirmationButtons(true)],
  });
}

async function handleUserInteraction(interaction, emojis) {
  const message = await interaction.fetchReply();
  const filter = i => {
    if (i.user.id !== interaction.user.id) {
      i.reply({ content: "You can't use these buttons.", ephemeral: true });
      return false;
    }
    return true;
  };

  const collector = message.createMessageComponentCollector({ filter, time: 30000 });

  collector.on('collect', async i => {
    await i.deferUpdate();

    if (i.customId === 'confirm') {
      if (!hasEmojiManagePermission(i.member)) {
        await interaction.editReply({
          content: 'Cancelling deletion. You lack **Manage Emojis** permission.',
          components: [confirmationButtons(false)],
        });
        return i.followUp({
          content: 'You need **Manage Emojis** permission to delete emojis.',
          ephemeral: true,
        });
      }

      await interaction.editReply({
        content: 'Deleting selected emojis...',
        components: [confirmationButtons(false)],
      });

      const results = await deleteEmojisParallel(emojis);
      await reportDeletionResults(interaction, results);

    } else if (i.customId === 'cancel') {
      const emojiList = emojis.map(e => e.toString()).join(' ');
      await interaction.editReply({
        content: `Cancelled. Emojis selected were: ${emojiList}`,
        components: [confirmationButtons(false)],
      });
    }
  });

  collector.on('end', async (_, reason) => {
    if (reason === 'time') {
      await interaction.editReply({
        content: 'User took too long. Deletion cancelled due to timeout.',
        components: [confirmationButtons(false)],
      });
    }
  });
}

async function deleteEmojisParallel(emojis) {
  const deletionPromises = emojis.map(emoji => {
    if (emoji.managed) {
      return Promise.resolve({ emoji, success: false, error: new Error('Managed emoji, skipped.') });
    }
    return emoji.delete()
      .then(() => ({ emoji, success: true }))
      .catch(error => ({ emoji, success: false, error }));
  });

  return Promise.allSettled(deletionPromises);
}

async function reportDeletionResults(interaction, results) {
  const successes = results
    .filter(r => r.status === 'fulfilled' && r.value.success)
    .map(r => r.value.emoji.toString());

  const failures = results
    .filter(r => r.status === 'fulfilled' && !r.value.success)
    .map(r => `${r.value.emoji.name} (${r.value.error.message})`);

  const embed = new EmbedBuilder()
    .setTitle('Emoji Deletion Results')
    .setDescription([
      successes.length > 0 ? `✅ Deleted: ${successes.join(' ')}` : '✅ No emojis deleted.',
      failures.length > 0 ? `❌ Failed: ${failures.join(', ')}` : '',
    ].join('\n'))
    .setColor(successes.length > 0 ? 0x00FF00 : 0xFF0000);

  await interaction.editReply({ embeds: [embed] });
}

async function handleExecuteError(error, interaction) {
  if (error.message.includes('content[BASE_TYPE_MAX_LENGTH]')) {
    await interaction.editReply({
      embeds: [
        sendErrorFeedback(
          interaction.commandName,
          'Too many emojis selected. Try again with a smaller number.'
        ),
      ],
    });
  } else {
    console.error(`Command: ${interaction.commandName}\nError: ${error.message}`);
    await interaction.editReply({
      embeds: [sendErrorFeedback(interaction.commandName)],
    });
  }
}
