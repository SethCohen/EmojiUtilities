const { setSetting } = require('../helpers/dbModel');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');
const { setPerms, adminCommands, manageEmojisCommands, mediaLinks } = require('../helpers/utilities');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('config')
		.setDescription('Change various bot functionalities.')
		.setDefaultPermission(false)
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
							['leaderboard', 'leaderboard'],
							['listemojis', 'listemojis'],
							['packsearch', 'packsearch'],
							['random', 'random'],
							['removeunused', 'removeunused'],
							['renameemoji', 'renameemoji'],
							['resetdb', 'resetdb'],
							['search', 'search'],
							['stickerfy', 'stickerfy'],
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

			if (adminCommands.includes(commandName)) {
				// Sets admin commands...
				interaction.guild.roles.cache.filter(role => role.permissions.has(Permissions.FLAGS.ADMINISTRATOR)).each(adminRole => {
					setPerms(adminRole, adminCommands, flag);
				});
			}
			else if (manageEmojisCommands.includes(commandName)) {
				// Sets manage emojis commands...
				interaction.guild.roles.cache.filter(role => role.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS)).each(manageEmojisRole => {
					setPerms(manageEmojisRole, manageEmojisCommands, flag);
				});
			}
			else {
				// Sets @everyone commands...
				const role = interaction.guild.roles.cache.get(interaction.guildId);
				setPerms(role, [commandName], flag);
			}

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
