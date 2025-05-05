import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField, MessageFlags } from 'discord.js';
import axios from 'axios';
import fs from 'fs';
import { sendErrorFeedback } from '../helpers/utilities.js';
import imageType from 'image-type';
import sharp from 'sharp';
import { mediaLinks } from '../helpers/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('uploademoji')
    .setDescription('Uploads a given URL as an emoji.')
    .addStringOption((option) =>
      option.setName('url').setDescription('The URL of the emoji to upload.').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('name').setDescription('Name for the emoji')
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      return interaction.editReply({
        content: 'You do not have enough permissions to use this command.\nRequires **Manage Emojis and Stickers**.',
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const url = interaction.options.getString('url');
      const nameInput = interaction.options.getString('name');
      const randomName = Math.random().toString(36).substring(2, 10);
      const name = nameInput || randomName;

      const dir = './temps';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }

      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data); // No need for utf-8, already binary

      const type = await imageType(buffer);
      if (!type) {
        return interaction.editReply({
          content: 'Invalid image type. Only supports .gif, .png, or .jpg',
        });
      }

      const tempPath = `${dir}/${Math.random().toString(36).substring(2, 10)}.${type.ext}`;

      await sharp(buffer, { animated: true })
        .resize(128, 128, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .gif({ colors: 32, dither: 0.0, loop: 0 })
        .toFile(tempPath);

      try {
        const createdEmoji = await interaction.guild.emojis.create({
          attachment: tempPath,
          name: name,
        });

        const embed = new EmbedBuilder()
          .setTitle(`✅ Added ${createdEmoji} to the server!`)

        await interaction.editReply({ embeds: [embed] });

      } catch (createError) {
        const invalidNameErrors = [
          'Invalid Form Body\nname: Must be between 2 and 32 in length.',
          'Invalid Form Body\nname: Must be between 2 and 32 in length. String value did not match validation regex.',
          'Invalid Form Body\nname: String value did not match validation regex.',
          'Invalid Form Body\nname[STRING_TYPE_REGEX]: String value did not match validation regex.',
        ];

        if (invalidNameErrors.includes(createError.message)) {
          return interaction.editReply({
            embeds: [
              sendErrorFeedback(
                interaction.commandName,
                'Invalid value in `name`.\nEmoji names must be 2–32 characters and only contain alphanumeric characters and underscores.'
              ),
            ],
          });
        }

        if (createError.message === 'Maximum number of emojis reached (50)') {
          return interaction.editReply({
            embeds: [sendErrorFeedback(interaction.commandName, 'No emoji slots available in server.')],
          });
        }

        if (createError.message === 'Missing Permissions') {
          return interaction.editReply({
            embeds: [
              sendErrorFeedback(
                interaction.commandName,
                'Bot is missing `Manage Emojis And Stickers` permission.'
              ),
            ],
          });
        }

        if (createError.message.includes('Invalid Form Body\nimage: Invalid image data')) {
          return interaction.editReply({
            embeds: [
              sendErrorFeedback(
                interaction.commandName,
                'Invalid image type. Only .jpg, .jpeg, .png, and .gif images are supported.'
              ),
            ],
          });
        }

        if (createError.message.includes('Failed to resize asset below the maximum size')) {
          return interaction.editReply({
            embeds: [
              sendErrorFeedback(
                interaction.commandName,
                "Couldn't resize image below 256KB limit. Please try a smaller image."
              ),
            ],
          });
        }

        console.error(`
**Command:** ${interaction.commandName}
**Error Message:** ${createError.message}
**Raw Input:**
- url: ${interaction.options.getString('url')}
- name: ${interaction.options.getString('name')}
        `);

        return interaction.editReply({
          embeds: [sendErrorFeedback(interaction.commandName)],
        });

      } finally {
        fs.unlink(tempPath, (err) => {
          if (err) console.error(`Failed to delete temp file: ${err}`);
        });
      }

    } catch (error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
        return interaction.editReply({
          embeds: [sendErrorFeedback(interaction.commandName, 'Invalid or unreachable URL in `url`.')],
        });
      }

      console.error(`
**Command:** ${interaction.commandName}
**Unexpected Error:** ${error.message}
      `);

      return interaction.editReply({
        embeds: [sendErrorFeedback(interaction.commandName)],
      });
    }
  },
};
