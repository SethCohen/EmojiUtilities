import fs from 'fs';
import archiver from 'archiver';
import { DataResolver, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import imageType from 'image-type';
import { mediaLinks } from '../helpers/constants.js';

const createZip = async (interaction) => {
  const dir = './temps';

  // Create temp directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  // Create a output path for the server's emojis
  const output = fs.createWriteStream(`${dir}/${interaction.guildId}_emojis.zip`);

  // Create a new archive
  const archive = archiver('zip', {
    zlib: { level: 9 },
  });

  output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
  });

  output.on('end', function () {
    console.log('Data has been drained');
  });

  archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
      console.log(err)
    } else {
      throw err;
    }
  });

  archive.on('error', function (err) {
    throw err;
  });

  archive.pipe(output);

  const emojis = await interaction.guild.emojis.fetch();
  for (const emoji of emojis.values()) {
    const buffer = await DataResolver.resolveFile(emoji.url)

    const filetype = await imageType(buffer.data);
    const fileName = emoji.name;
    const filepath = `${fileName}.${filetype.ext}`;

    archive.append(buffer.data, { name: filepath });
  }

  await archive.finalize();

  return `${dir}/${interaction.guildId}_emojis.zip`;
};

const deleteZip = (zipPath) => {
  fs.unlink(zipPath, (err) => {
    if (err) throw err;
    // console.log(`${zipPath} was deleted.`);
  });
};

export default {
  data: new SlashCommandBuilder()
    .setName('backupemojis')
    .setDescription('Returns a .zip of all the emojis in a server.'),
  async execute(interaction) {
    await interaction.deferReply();

    await interaction.editReply({ content: 'Backing up emojis...' });
    const zipPath = await createZip(interaction);

    const embedSuccess = new EmbedBuilder().setDescription(
      `If you've enjoyed this bot so far, please consider voting for it.\nIt helps the bot grow. 🙂\n${mediaLinks}`,
    );

    await interaction.editReply({
      content: `Done. The file below contains all the emojis from **${interaction.guild.name}**.`,
      embeds: [embedSuccess],
      files: [zipPath],
    });

    deleteZip(zipPath);
  },
};
