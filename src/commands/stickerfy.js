import { SlashCommandBuilder, PermissionsBitField, MessageFlags } from 'discord.js';
import fs from 'fs';
import axios from 'axios';
import { sendErrorFeedback } from '../helpers/utilities.js';
import converter from 'discord-emoji-converter';
import imageType from 'image-type';
import sharp from 'sharp';
import isAnimated from 'is-animated';
import toApng from 'gif-to-apng';

const ensureTempDir = () => {
  const dir = './temps';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  return dir;
};

const uploadSticker = async (interaction, input, name, tag) => {
  try {
    const sticker = await interaction.guild.stickers.create({ file: input, name, tags: tag });
    await interaction.editReply({
      content: `✅ Created new sticker: **${sticker.name}**!`,
      flags: MessageFlags.Ephemeral,
    });
  } catch (error) {
    const knownErrors = {
      'Maximum number of stickers reached (0)': 'No sticker slots available in server.',
      'Maximum number of stickers reached (5)': 'No sticker slots available in server.',
      'Maximum number of stickers reached (15)': 'No sticker slots available in server.',
      'Maximum number of stickers reached (60)': 'No sticker slots available in server.',
      'Missing Permissions': 'Bot is missing `Manage Emojis And Stickers` permission.',
      'Asset exceeds maximum size: 33554432': 'Sticker file too large (must be under 32MB).',
      'Invalid Form Body\nname: Must be between 2 and 30 in length.': '`name` must be 2–30 characters long.',
      'Invalid Form Body\nname[BASE_TYPE_BAD_LENGTH]: Must be between 2 and 30 in length.': '`name` must be 2–30 characters long.',
      'Sticker animation duration exceeds maximum of 5 seconds': 'Animated sticker exceeds 5-second limit.',
      'Invalid Asset': 'Invalid asset. Must be valid PNG or APNG.',
    };

    const errorMsg = knownErrors[error.message] || null;

    if (errorMsg) {
      await interaction.editReply({
        embeds: [sendErrorFeedback(interaction.commandName, errorMsg)],
        flags: MessageFlags.Ephemeral,
      });
    } else {
      console.error(`Command: ${interaction.commandName}\nError:`, error.stack || error.message);
      await interaction.editReply({
        embeds: [sendErrorFeedback(interaction.commandName)],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
};

export default {
  data: new SlashCommandBuilder()
    .setName('stickerfy')
    .setDescription('Convert an image URL into a Discord sticker (supports jpg, png, gif, webp).')
    .addStringOption(option =>
      option.setName('url').setDescription('The URL of the image.').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('name').setDescription('The name for the sticker.').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('tag').setDescription('Unicode emoji representing the sticker.').setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
        return await interaction.editReply({
          content: 'You do not have permission to use this command.\nRequires **Manage Emojis and Stickers**.',
          flags: MessageFlags.Ephemeral,
        });
      }

      const url = interaction.options.getString('url');
      const name = interaction.options.getString('name');
      let tag = interaction.options.getString('tag');

      const dir = ensureTempDir();
      tag = converter.getShortcode(tag, false);

      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);
      const filename = Math.random().toString(36).slice(2, 10);
      const filepath = `${dir}/${filename}`;
      const type = await imageType(buffer);

      if (!type || !['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(type.ext)) {
        return await interaction.editReply({
          content: 'Invalid image type. Only PNG, JPG, GIF, WEBP supported.',
          flags: MessageFlags.Ephemeral,
        });
      }

      if (isAnimated(buffer) && type.ext !== 'png') {
        await sharp(buffer, { animated: true })
          .resize(320, 320, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .gif({ colours: 32, dither: 0.0, loop: 0 })
          .toFile(`${filepath}.gif`);

        await toApng(`${filepath}.gif`);
        await uploadSticker(interaction, `${filepath}.png`, name, tag);
      } else {
        await sharp(buffer)
          .resize(320, 320, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toFile(`${filepath}.png`);

        await uploadSticker(interaction, `${filepath}.png`, name, tag);
      }

    } catch (error) {
      const knownErrors = {
        "Emoji doesn't exist": 'Invalid value in `tag`. Expected a valid Unicode emoji (e.g., 🍌).',
        'connect ECONNREFUSED 127.0.0.1:80': 'Invalid URL provided.',
        'connect ECONNREFUSED ::1:80': 'Invalid URL provided.',
        "Cannot read properties of null (reading 'ext')": "Couldn't detect image type. Please provide a direct link to the image.",
        "Request failed with status code 429": 'URL rate limited. Try again later.',
      };

      const errorMsg = knownErrors[error.message] || null;

      if (errorMsg) {
        await interaction.editReply({
          embeds: [sendErrorFeedback(interaction.commandName, errorMsg)],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        console.error(`Command: ${interaction.commandName}\nError:`, error.stack || error.message);
        await interaction.editReply({
          embeds: [sendErrorFeedback(interaction.commandName)],
          flags: MessageFlags.Ephemeral,
        });
      }

    } finally {
      fs.readdir('./temps', (err, files) => {
        if (err) return;
        for (const file of files) {
          if (file.endsWith('.png') || file.endsWith('.gif')) {
            fs.unlink(`./temps/${file}`, err => {
              if (err) console.error(`Failed to delete temp file: ${file}`);
            });
          }
        }
      });
    }
  },
};
