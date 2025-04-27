import axios from 'axios';
import { findBestMatch } from 'string-similarity';
import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField, MessageFlags } from 'discord.js';
import { sendErrorFeedback, confirmationButtons } from '../helpers/utilities.js';
import { getGuildInfo } from '../helpers/mongodbModel.js';

export default {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Searches for an emoji from emoji.gg')
    .addStringOption(option =>
      option.setName('name').setDescription('Name of an emoji to search for.').setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('category')
        .setDescription('The category to search in for the emoji.')
        .addChoices(
          { name: 'Original Style', value: 1 },
          { name: 'TV / Movie', value: 2 },
          { name: 'Meme', value: 3 },
          { name: 'Anime', value: 4 },
          { name: 'Celebrity', value: 5 },
          { name: 'Blobs', value: 6 },
          { name: 'Thinking', value: 7 },
          { name: 'Animated', value: 8 },
          { name: 'NSFW', value: 9 },
          { name: 'Gaming', value: 10 },
          { name: 'Letters', value: 11 },
          { name: 'Other', value: 12 },
          { name: 'Pepe', value: 13 },
          { name: 'Logos', value: 14 },
          { name: 'Cute', value: 15 },
          { name: 'Utility', value: 16 },
          { name: 'Animals', value: 17 },
          { name: 'Recolors', value: 18 },
          { name: 'Flags', value: 19 },
          { name: 'Hearts', value: 20 }
        )
    )
    .addBooleanOption(option =>
      option.setName('includensfw')
        .setDescription('Includes NSFW results. Default: False')
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const response = await axios.get('https://emoji.gg/api');

      const name = interaction.options.getString('name');
      const nsfw = interaction.options.getBoolean('includensfw') ?? false;
      const category = interaction.options.getInteger('category');
      const guildInfo = await getGuildInfo(interaction.client.db, interaction.guild);

      let data;

      if (nsfw) {
        if (!interaction.channel.nsfw) {
          return await interaction.editReply({ content: 'Sorry, NSFW content is only allowed in NSFW channels.', flags: MessageFlags.Ephemeral });
        }
        if (!guildInfo.settings.allownsfw) {
          return await interaction.editReply({ content: 'Sorry, searching for NSFW is disabled in this server.', flags: MessageFlags.Ephemeral });
        }
        data = category
          ? response.data.filter(e => e.category === category)
          : response.data;
      } else {
        if (category === 9) {
          return await interaction.editReply({ content: 'Searching the NSFW category requires **includensfw: True**.', flags: MessageFlags.Ephemeral });
        }
        data = category
          ? response.data.filter(e => e.category === category)
          : response.data.filter(e => e.category !== 9);
      }

      const match = findBestMatch(name, data.map(e => e.title));

      const embed = new EmbedBuilder()
        .setTitle(data[match.bestMatchIndex].title)
        .setDescription(`This emoji had the highest match to your search at ${(match.bestMatch.rating * 100).toFixed(2)}%.\nWould you like to upload it to the server?`)
        .setImage(data[match.bestMatchIndex].image);

      await interaction.editReply({
        embeds: [embed],
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

      const buttonInteraction = await message.awaitMessageComponent({ filter, time: 30_000 });

      if (buttonInteraction.customId === 'confirm') {
        if (!buttonInteraction.memberPermissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
          await interaction.editReply({
            content: 'Cancelling emoji adding. User lacks Manage Emojis permission.',
            flags: MessageFlags.Ephemeral,
            components: [],
          });
          return await buttonInteraction.followUp({
            content: 'You do not have enough permissions to use this command.\nRequires **Manage Emojis**.',
            flags: MessageFlags.Ephemeral,
          });
        }

        try {
          const emoji = await interaction.guild.emojis.create({
            attachment: data[match.bestMatchIndex].image,
            name: data[match.bestMatchIndex].title,
          });

          await interaction.editReply({
            content: `✅ Added ${emoji} to the server!`,
            flags: MessageFlags.Ephemeral,
            components: [],
          });
        } catch (error) {
          switch (error.message) {
            case 'Maximum number of emojis reached (50)':
              await interaction.followUp({
                embeds: [
                  sendErrorFeedback(interaction.commandName, 'No emoji slots available in server.'),
                ],
                flags: MessageFlags.Ephemeral,
              });
              break;
            case 'Invalid Form Body\nimage: File cannot be larger than 256.0 kb.':
              await interaction.followUp({
                embeds: [
                  sendErrorFeedback(interaction.commandName, 'Image filesize is too big. Cannot add to server.'),
                ],
                flags: MessageFlags.Ephemeral,
              });
              break;
            default:
              console.error(`Command: ${interaction.commandName}\nError: ${error.message}`);
              await interaction.followUp({
                embeds: [sendErrorFeedback(interaction.commandName)],
                flags: MessageFlags.Ephemeral,
              });
          }
        }
      } else if (buttonInteraction.customId === 'cancel') {
        await interaction.editReply({ content: 'Canceled.', flags: MessageFlags.Ephemeral, components: [] });
      }

    } catch (error) {
      if (error.message === 'no such table: serverSettings') {
        await interaction.editReply({
          embeds: [
            sendErrorFeedback(
              interaction.commandName,
              'Guild database not found!\nA new one was created.\nPlease try again.'
            ),
          ],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        console.error(`Command: ${interaction.commandName}\nError: ${error.message}`);
        await interaction.editReply({
          embeds: [sendErrorFeedback(interaction.commandName)],
          flags: MessageFlags.Ephemeral,
        });
      }
    } finally {
      // Disable buttons after any outcome
      await interaction.editReply({ components: [confirmationButtons(false)], flags: MessageFlags.Ephemeral });
    }
  },
};
