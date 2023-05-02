import fs from 'fs';
import axios from 'axios';
import archiver from 'archiver';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { mediaLinks } from '../helpers/constants.js';

const createZip = async (interaction) => {
  const dir = './temps';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const dirPath = `${dir}/${interaction.guildId}_emojis`;
  const output = fs.createWriteStream(dirPath + '.zip');
  const archive = archiver('zip', {
    zlib: { level: 9 },
  });

  output.on('close', function () {
    // console.log(archive.pointer() + ' total bytes');
    // console.log('Archiver has been finalized and the output file descriptor has closed.');
  });
  archive.on('error', function (err) {
    throw err;
  });

  archive.pipe(output);
  const emojis = await interaction.guild.emojis.fetch();
  for await (const emoji of emojis) {
    const imageType = emoji[1].url.slice(-4);
    const fileName = emoji[1].name;

    const response = await axios.get(emoji[1].url, {
      responseType: 'arraybuffer',
    });
    const buffer = Buffer.from(response.data, 'utf-8');

    archive.append(buffer, { name: fileName + imageType });
  }
  await archive.finalize();

  return dirPath + '.zip';
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

    await deleteZip(zipPath);
  },
};
