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
      const [response, guildInfo] = await Promise.all([
        axios.get('https://emoji.gg/api/'),
        getGuildInfo(interaction.client.db, interaction.guild)
      ]);

      const nsfwRequested = interaction.options.getBoolean('includensfw') ?? false;
      const emojis = nsfwRequested ? response.data : response.data.filter(e => e.category !== 9);

      if (nsfwRequested) {
        if (!interaction.channel.nsfw) {
          return interaction.editReply({ content: 'NSFW content is only allowed in NSFW channels.' });
        }
        if (!guildInfo.settings.allownsfw) {
          return interaction.editReply({ content: 'NSFW searching is disabled on this server.' });
        }
      }

      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      const embed = new EmbedBuilder()
        .setTitle(randomEmoji.title)
        .setDescription('Found a random emoji. Would you like to upload it to the server?')
        .setImage(randomEmoji.image);

      await interaction.editReply({
        embeds: [embed],
        components: [confirmationButtons(true)],
      });

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
          if (!i.memberPermissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
            await interaction.editReply({
              content: 'Cancelling upload. You lack **Manage Emojis** permission.',
              embeds: [embed],
              components: [confirmationButtons(false)],
            });
            return i.followUp({ content: 'You need **Manage Emojis** permission to use this.', ephemeral: true });
          }

          try {
            const emoji = await interaction.guild.emojis.create({
              attachment: randomEmoji.image,
              name: randomEmoji.title,
            });
            await interaction.editReply({
              content: `Added ${emoji} to the server!`,
              components: [confirmationButtons(false)],
            });
          } catch (error) {
            await handleEmojiCreationError(error, interaction);
          }
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

    } catch (error) {
      console.error(`Command: ${interaction.commandName}\nError: ${error.message}`);
      await interaction.editReply({
        embeds: [sendErrorFeedback(interaction.commandName)],
      });
    }
  },
};

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
