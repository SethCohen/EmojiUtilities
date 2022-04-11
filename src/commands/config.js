const { setSetting } = require('../helpers/dbModel');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');
const { mediaLinks } = require('../helpers/utilities');

const setCommandAvailability = async (guild, commandName, flag) => {
	const applicationCommands = await guild.client.application.commands.fetch();
	const foundCommand = await applicationCommands.filter(command => command.name === commandName);

	const permission = {
		guild: guild.id,
		permissions: {
			id: guild.id,
			type: 'ROLE',
			permission: flag,
		},
	};

	return foundCommand.first().permissions.add(permission);
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('config')
		.setDescription('Change various bot functionalities.')
		.addSubcommand(subcommand =>
			subcommand.setName('countmessages')
				.setDescription('Allows bot to count reactions. Default: true')
				.addBooleanOption(option =>
					option.setName('flag')
						.setDescription('Set flag')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('countreacts')
				.setDescription('Allows bot to count messages. Default: true')
				.addBooleanOption(option =>
					option.setName('flag')
						.setDescription('Set flag')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('countselfreacts')
				.setDescription('Allows bot to count self reacts on self messages. Default: true')
				.addBooleanOption(option =>
					option.setName('flag')
						.setDescription('Set flag')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('allownsfw')
				.setDescription('Allows NSFW images in emoji.gg commands. Default: false')
				.addBooleanOption(option =>
					option.setName('flag')
						.setDescription('Set flag')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('togglecommand')
				.setDescription('Disables/Enables a specified command')
				.addStringOption(option =>
					option.setName('commandname')
						.setDescription('Set flag')
						.setRequired(true)
						.addChoices([
							['backupemojis', 'backupemojis'],
							['botinfo', 'botinfo'],
							['clapify', 'clapify'],
							['copysteal', 'copysteal'],
							['dancify', 'dancify'],
							['displaystats', 'displaystats'],
							['emoji', 'emoji'],
							['enlargeemoji', 'enlargeemoji'],
							['getcount', 'getcount'],
							['help', 'help'],
							['leaderboard', 'leaderboard'],
							['listemojis', 'listemojis'],
							['lockemoji', 'lockemoji'],
							['packsearch', 'packsearch'],
							['random', 'random'],
							['removeunused', 'removeunused'],
							['renameemoji', 'renameemoji'],
							['resetdb', 'resetdb'],
							['search', 'search'],
							['stickerfy', 'stickerfy'],
							['unlockemoji', 'unlockemoji'],
							['uploademoji', 'uploademoji'],
						]))
				.addBooleanOption(option =>
					option.setName('flag')
						.setDescription('Set flag')
						.setRequired(true))),
	async execute(interaction) {
		if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
			return interaction.reply({
				content: 'You do not have enough permissions to use this command.\nRequires **Administrator**.',
				ephemeral: true,
			});
		}

		await interaction.deferReply({ ephemeral: true });
		const setting = interaction.options.getSubcommand();
		const flag = interaction.options.getBoolean('flag') ? 1 : 0;
		const embedSuccess = new MessageEmbed()
			.setDescription(`If you've enjoyed this bot so far, please consider voting for it.\nIt helps the bot grow. 🙂\n${mediaLinks}`);

		if (setting === 'togglecommand') {
			const commandName = interaction.options.getString('commandname');
			await setCommandAvailability(interaction.guild, commandName, !!flag);

			embedSuccess.setTitle(`\`/${commandName}\` ${flag ? 'enabled' : 'disabled'}.`);
			return interaction.editReply({ embeds: [embedSuccess] });
		}
		else {
			embedSuccess.setTitle(`\`${setting}\` set to \`${Boolean(flag)}\`.`);
			setSetting(interaction.guild.id, setting, flag);
			return interaction.editReply({ embeds: [embedSuccess] });
		}

	},
};
