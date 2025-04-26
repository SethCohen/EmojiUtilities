import axios from 'axios';
import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import { sendErrorFeedback, confirmationButtons } from '../helpers/utilities.js';
import { getGuildInfo } from '../helpers/mongodbModel.js';

export default {
  data: new SlashCommandBuilder()
    .setName('random')
    .setDescription('Gets a random emoji as an image.')
    .addBooleanOption(option =>
      option.setName('includensfw').setDescription('Includes NSFW results. Default: False')
    ),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const [emojiData, guildInfo] = await fetchData(interaction.client.db, interaction.guild);
      const nsfwRequested = interaction.options.getBoolean('includensfw') ?? false;

      if (nsfwRequested && !await validateNSFW(interaction, guildInfo)) return;

      const emojis = filterEmojis(emojiData, nsfwRequested);
      const randomEmoji = pickRandomEmoji(emojis);
      const embed = createEmojiEmbed(randomEmoji);

      await sendInitialReply(interaction, embed);
      await handleUserInteraction(interaction, randomEmoji, embed);

    } catch (error) {
      console.error(`Command: ${interaction.commandName}\nError: ${error.message}`);
      await interaction.editReply({
        embeds: [sendErrorFeedback(interaction.commandName)],
      });
    }
  },
};

// --- Helper Functions ---

async function fetchData(db, guild) {
  const [emojiResponse, guildInfo] = await Promise.all([
    axios.get('https://emoji.gg/api/'),
    getGuildInfo(db, guild),
  ]);
  return [emojiResponse.data, guildInfo];
}

async function validateNSFW(interaction, guildInfo) {
  if (!interaction.channel.nsfw) {
    await interaction.editReply({ content: 'NSFW content is only allowed in NSFW channels.' });
    return false;
  }
  if (!guildInfo.settings.allownsfw) {
    await interaction.editReply({ content: 'NSFW searching is disabled on this server.' });
    return false;
  }
  return true;
}

function filterEmojis(emojis, includeNSFW) {
  return includeNSFW ? emojis : emojis.filter(e => e.category !== 9);
}

function pickRandomEmoji(emojis) {
  return emojis[Math.floor(Math.random() * emojis.length)];
}

function createEmojiEmbed(emoji) {
  return new EmbedBuilder()
    .setTitle(emoji.title)
    .setDescription('Found a random emoji. Would you like to upload it to the server?')
    .setImage(emoji.image);
}

async function sendInitialReply(interaction, embed) {
  await interaction.editReply({
    embeds: [embed],
    components: [confirmationButtons(true)],
  });
}

async function handleUserInteraction(interaction, emojiData, embed) {
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
      await handleConfirm(interaction, emojiData);
    } else if (i.customId === 'cancel') {
      await interaction.editReply({
        content: 'Cancelled.',
        embeds: [embed],
        components: [confirmationButtons(false)],
      });
    }
  });

  collector.on('end', async (_, reason) => {
    if (reason === 'time') {
      await interaction.editReply({
        content: 'User took too long. Interaction timed out.',
        embeds: [embed],
        components: [confirmationButtons(false)],
      });
    }
  });
}

async function handleConfirm(interaction, emojiData) {
  if (!interaction.memberPermissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
    await interaction.editReply({
      content: 'Cancelling upload. You lack **Manage Emojis** permission.',
      components: [confirmationButtons(false)],
    });
    return interaction.followUp({
      content: 'You need **Manage Emojis** permission to upload emojis.',
      ephemeral: true,
    });
  }

  try {
    const emoji = await interaction.guild.emojis.create({
      attachment: emojiData.image,
      name: emojiData.title,
    });

    await interaction.editReply({
      content: `Added ${emoji} to the server!`,
      components: [confirmationButtons(false)],
    });
  } catch (error) {
    await handleEmojiCreationError(error, interaction);
  }
}

async function handleEmojiCreationError(error, interaction) {
  let errorMessage = 'Unknown error adding emoji.';
  if (error.message.includes('Maximum number of emojis')) {
    errorMessage = 'No emoji slots available on the server.';
  } else if (error.message.includes('File cannot be larger than 256.0 kb')) {
    errorMessage = 'Image file too large to upload.';
  } else if (error.message.includes('Missing Permissions')) {
    errorMessage = 'Bot is missing **Manage Emojis & Stickers** permission.';
  }

  await interaction.followUp({
    embeds: [sendErrorFeedback(interaction.commandName, errorMessage)],
  });
}
