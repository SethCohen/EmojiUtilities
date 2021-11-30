const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const axios = require('axios');
const archiver = require('archiver');
const { MessageEmbed } = require('discord.js');
const { mediaLinks } = require('../helpers/utilities');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('backupemojis')
		.setDescription('Returns a .zip of all the emojis in a server.'),
	async execute(interaction) {
		await interaction.deferReply();

		const dirPath = `./src/temps/${interaction.guildId}_emojis`;
		const output = fs.createWriteStream(dirPath + '.zip');
		const archive = archiver('zip');

		output.on('close', function() {
			console.log(archive.pointer() + ' total bytes');
			console.log('Archiver has been finalized and the output file descriptor has closed.');
		});
		archive.on('error', function(err) {
			throw err;
		});

		await interaction.editReply({ content: 'Downloading emojis...' });
		archive.pipe(output);
		const emojis = await interaction.guild.emojis.fetch();
		for await (const emoji of emojis) {
			const imageType = emoji[1].url.slice(-4);
			const fileName = emoji[1].name;

			const response = await axios.get(emoji[1].url, { responseType: 'arraybuffer' });
			const buffer = Buffer.from(response.data, 'utf-8');

			archive.append(buffer, { name: fileName + imageType });
		}
		await archive.finalize();

		const embed = new MessageEmbed()
			.setDescription(`If you've enjoyed this bot so far, please consider voting for it.\nIt helps the bot grow. 🙂\n${mediaLinks}`);
		await interaction.editReply({
			content: `Done. The file below contains all the emojis from **${interaction.guild.name}**.`,
			embeds: [embed],
			files: [dirPath + '.zip'],
		});

		fs.unlink(dirPath + '.zip', (err) => {
			if (err) throw err;
			console.log(`${dirPath + '.zip'} was deleted.`);
		});
	},
};
