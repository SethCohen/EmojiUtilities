import { promises as fsPromises, existsSync, mkdirSync, createWriteStream } from 'fs';
import archiver from 'archiver';
import discord from 'discord.js';
const { DataResolver, EmbedBuilder, SlashCommandBuilder } = discord;
import imageType from 'image-type';
import { mediaLinks } from '../helpers/constants.js';

const ensureTempDir = () => {
  const dir = './temps';
  if (!existsSync(dir)) {
    mkdirSync(dir);
  }
  return dir;
};

const createZip = async (interaction) => {
  const dir = ensureTempDir();
  const zipPath = `${dir}/${interaction.guildId}_emojis.zip`;
  const output = createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.pipe(output);

  const emojis = await interaction.guild.emojis.fetch();

  const emojiBuffers = await Promise.all(
    emojis.map(async (emoji) => {
      try {
        const response = await fetch(emoji.imageURL());
        const buffer = Buffer.from(await response.arrayBuffer());
        const filetype = await imageType(buffer);
        const filepath = `${emoji.name}.${filetype.ext}`;
        return { buffer, filepath };
      } catch (err) {
        console.error(`Failed to fetch emoji ${emoji.name}:`, err);
        return null;
      }
    })
  );

  for (const entry of emojiBuffers) {
    if (entry) {
      archive.append(entry.buffer, { name: entry.filepath });
    }
  }

  await archive.finalize();
  await new Promise((resolve, reject) => {
    output.on('close', resolve);
    output.on('error', reject);
  });

  return zipPath;
};

const deleteZip = async (zipPath) => {
  await fsPromises.unlink(zipPath);
};

export default {
  data: new SlashCommandBuilder()
    .setName('backupemojis')
    .setDescription('Returns a .zip of all the emojis in a server.'),
  async execute(interaction) {
    await interaction.deferReply();
    await interaction.editReply({ content: 'Backing up server emojis...' });

    try {
      const zipPath = await createZip(interaction);

      await interaction.editReply({
        content: `Backup complete! Here's your zip file containing emojis from **${interaction.guild.name}**.`,
        files: [zipPath],
      });

      await deleteZip(zipPath);
    } catch (error) {
      console.error('Failed to backup emojis:', error);
      await interaction.editReply({ content: 'Failed to backup emojis. Please try again later.' });
    }
  },
};
