import axios from 'axios';
import { findBestMatch } from 'string-similarity';
import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField, MessageFlags } from 'discord.js';
import { sendErrorFeedback, navigationButtons, confirmationButtons } from '../helpers/utilities.js';
import { mediaLinks } from '../helpers/constants.js';

const fetchAndCleanPack = async (slug) => {
  const response = await axios.get(`https://emoji.gg/pack/${slug}&type=json`, {
    responseType: 'text',
  });
  const cleanJsonString = response.data.split('<script')[0].trim();
  return JSON.parse(cleanJsonString);
};

const createPages = (packData) => {
  if (!packData?.emotes || !Array.isArray(packData.emotes)) {
    throw new Error('Invalid pack structure: missing emotes.');
  }

  return packData.emotes.map((emoji, index) =>
    new EmbedBuilder()
      .setTitle(`${packData.name} Pack`)
      .setDescription(mediaLinks)
      .setImage(emoji.url)
      .setFooter({ text: `Page ${index + 1}/${packData.emotes.length} | ${emoji.name}` })
  );
};

const handleConfirm = async (button, interaction, packData, uploadedPages, pages, updateView, collector, currentPageIndexObj) => {
  if (!interaction.memberPermissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
    await interaction.followUp({
      content: 'You do not have enough permissions to use this command.\nRequires **Manage Emojis**.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (uploadedPages.has(currentPageIndexObj.value)) {
    await interaction.followUp({
      content: 'This emoji has already been added!',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    const createdEmoji = await interaction.guild.emojis.create({
      attachment: packData.emotes[currentPageIndexObj.value].url,
      name: packData.emotes[currentPageIndexObj.value].name.replace(/-/g, ''),
    });

    uploadedPages.add(currentPageIndexObj.value);

    await interaction.followUp({
      content: `Added ${createdEmoji} to server!`,
      flags: MessageFlags.Ephemeral,
    });

    currentPageIndexObj.value = (currentPageIndexObj.value + 1) % pages.length;
    await updateView(true);

  } catch (error) {
    const errMsg = error.message;

    if (errMsg.includes('Maximum number of emojis')) {
      await interaction.followUp({
        embeds: [sendErrorFeedback(interaction.commandName, 'No emoji slots available in server.')],
        flags: MessageFlags.Ephemeral,
      });
      collector.stop();
    } else if (errMsg.includes('File cannot be larger than') || errMsg.includes('Failed to resize asset')) {
      await interaction.followUp({
        embeds: [sendErrorFeedback(interaction.commandName, "This image is over 256kb and cannot be uploaded.")],
        flags: MessageFlags.Ephemeral,
      });
    } else {
      console.error(`Command:\n${interaction.commandName}\nEmoji Upload Error:\n${error.stack}`);
      await interaction.followUp({
        embeds: [sendErrorFeedback(interaction.commandName)],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
};

const handleButtonInteraction = async (button, interaction, packData, uploadedPages, pages, updateView, collector, currentPageIndexObj) => {
  if (button.user.id !== interaction.user.id) {
    await button.reply({
      content: "You can't interact with this button. You are not the command author.",
      flags: MessageFlags.Ephemeral,
    }).catch(() => {});
    return;
  }

  await button.deferUpdate();

  switch (button.customId) {
    case 'confirm':
      await handleConfirm(button, interaction, packData, uploadedPages, pages, updateView, collector, currentPageIndexObj);
      break;

    case 'cancel':
      await interaction.editReply({ content: 'Canceled.' });
      await updateView(false);
      collector.stop();
      break;

    case 'next':
      currentPageIndexObj.value = (currentPageIndexObj.value + 1) % pages.length;
      await updateView(true);
      break;

    case 'prev':
      currentPageIndexObj.value = (currentPageIndexObj.value - 1 + pages.length) % pages.length;
      await updateView(true);
      break;
  }
};

export default {
  data: new SlashCommandBuilder()
    .setName('packsearch')
    .setDescription('Searches for an emoji pack from emoji.gg')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Name of the pack to search for.')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const apiResponse = await axios.get('https://emoji.gg/api/packs');
      const name = interaction.options.getString('name');
      const packs = apiResponse.data;

      const match = findBestMatch(name, packs.map(pack => pack.name));
      const bestMatchPack = packs[match.bestMatchIndex];
      if (!bestMatchPack || !bestMatchPack.slug) {
        throw new Error('Failed to find a matching emoji pack.');
      }

      const packData = await fetchAndCleanPack(bestMatchPack.slug);

      if (!packData?.emotes || !Array.isArray(packData.emotes)) {
        console.error('Unexpected pack response:', packData);
        throw new Error('Failed to load pack details from emoji.gg.');
      }

      const currentPageIndexObj = { value: 0 };
      const pages = createPages(packData);

      const updateView = async (componentsEnabled = true, contentOverride = null) => {
        await interaction.editReply({
          content: contentOverride ?? `This pack matched your search with ${(match.bestMatch.rating * 100).toFixed(2)}% similarity.`,
          embeds: [pages[currentPageIndexObj.value]],
          components: componentsEnabled ? [navigationButtons(true), confirmationButtons(true)] : [navigationButtons(false), confirmationButtons(false)],
        });
      };

      await updateView(true);

      const message = await interaction.fetchReply();
      const collector = message.createMessageComponentCollector({ time: 120000 });
      const uploadedPages = new Set();

      collector.on('collect', async button => {
        await handleButtonInteraction(button, interaction, packData, uploadedPages, pages, updateView, collector, currentPageIndexObj);
      });

      collector.on('end', async () => {
        try {
          await interaction.editReply({
            content: 'Command timed out.',
            components: [navigationButtons(false), confirmationButtons(false)],
          });
        } catch (error) {
          if (!error.message.includes('Unknown Message')) {
            console.error(`Command:\n${interaction.commandName}\nTimeout Error:\n${error.stack}`);
          }
        }
      });

    } catch (error) {
      console.error(`Command:\n${interaction.commandName}\nFatal Error:\n${error.stack}`);
      await interaction.editReply({
        embeds: [sendErrorFeedback(interaction.commandName)],
      });
    }
  },
};
