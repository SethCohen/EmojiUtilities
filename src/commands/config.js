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

			const guildRoles = await interaction.guild.roles.fetch();

			if (adminCommands.includes(commandName)) {
				// sets admin commands role perm
				const adminRoles = await guildRoles.filter(role => role.permissions.has(Permissions.FLAGS.ADMINISTRATOR));
				await setPerms(interaction.guild, adminRoles, [commandName], !!flag);
			}
			else if (manageEmojisCommands.includes(commandName)) {
				// Sets manage emojis commands role perm
				const manageEmojisRoles = await guildRoles.filter(role => role.permissions.has(Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS));
				await setPerms(interaction.guild, manageEmojisRoles, [commandName], !!flag);
			}
			else {
				// Sets @everyone commands...
				const role = interaction.guild.roles.cache.get(interaction.guildId);
				await setPerms(interaction.guild, [role], [commandName], !!flag);
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
