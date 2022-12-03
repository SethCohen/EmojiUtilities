import { setSetting } from '../helpers/dbModel.js';
import { EmbedBuilder, SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import { mediaLinks, sendErrorFeedback } from '../helpers/utilities.js';

export default {
	data: new SlashCommandBuilder()
		.setName('config')
		.setDescription('Change various bot functionalities.')
		.addSubcommand(subcommand =>
			subcommand.setName('countmessages')
				.setDescription('Allows bot to count messages. Default: true')
				.addBooleanOption(option =>
					option.setName('flag')
						.setDescription('Set flag')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('countreacts')
				.setDescription('Allows bot to count reactions. Default: true')
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
						.setRequired(true))),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			return interaction.editReply({
				content: 'You do not have enough permissions to use this command.\nRequires **Administrator**.',
				ephemeral: true,
			});
		}

		const setting = interaction.options.getSubcommand();
		const flag = interaction.options.getBoolean('flag') ? 1 : 0;
		const embedSuccess = new EmbedBuilder()
			.setDescription(`If you've enjoyed this bot so far, please consider voting for it.\nIt helps the bot grow. 🙂\n${mediaLinks}`);

		try {
			embedSuccess.setTitle(`\`${setting}\` set to \`${Boolean(flag)}\`.`);
			await setSetting(interaction.guild.id, setting, flag);
			return interaction.editReply({ embeds: [embedSuccess] });
		}
		catch (error) {
			switch (error.message) {
			case 'Bots cannot use this endpoint':
				await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName, 'Discord recently updated their API, disabling the ability for bots to set command permissions.\nHopefully their new system is updated to re-allow this ability, but in the mean time, you can toggle commands yourself via:\n`Server Settings -> Integrations -> Emoji Utilities -> Manage`')] });
				break;
			default:
				console.error(`Command:\n${interaction.commandName}\nError Message:\n${error.message}\nRaw Input:\n${setting}\n${flag} `);
				return await interaction.editReply({ embeds: [sendErrorFeedback(interaction.commandName)] });
			}
		}
	},
};
