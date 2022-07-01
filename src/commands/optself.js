const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { setOpt, clearUserFromDb } = require('../helpers/dbModel');
const { confirmationButtons } = require('../helpers/utilities');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('optself')
		.setDescription('Opts the command user in or out of emoji usage logging.')
		.addStringOption(option =>
			option.setName('flag')
				.setDescription('Whether to opt-in or opt-out')
				.addChoices(
					{ name: 'Opt-in', value: 'true' },
					{ name: 'Opt-out', value: 'false' })
				.setRequired(true)),
	async execute(interactionCommand) {
		await interactionCommand.deferReply({ ephemeral: true });

		const flag = interactionCommand.options.getString('flag');

		const embed = new MessageEmbed()
			.setTitle(`Are you sure you want to opt-${flag === 'true' ? 'in' : 'out'} of your server's database?`)
			.setDescription(`${flag === 'true' ? 'Opting in will allow the bot to record your emoji usage again.' : 'Opting out will both disallow that AND **clear all previous records of your emoji usage from your server\'s database immediately.**\nThis is a permanent decision. There is no undoing this action.'}`);

		await interactionCommand.editReply({
			embeds: [embed],
			components: [confirmationButtons(true)],
		});

		// Create button listeners
		const message = await interactionCommand.fetchReply();
		const filter = i => {
			i.deferUpdate();
			return i.user.id === interactionCommand.user.id;
		};
		message.awaitMessageComponent({ filter, time: 30000 })
			.then(async interactionButton => {
				if (interactionButton.customId === 'confirm') {
					await interactionCommand.editReply({ components: [confirmationButtons(false)] });
					await interactionButton.followUp({
						content: `You have opted-${flag === 'true' ? 'in' : 'out'}. Take care!`,
						ephemeral: true,
					});

					setOpt(interactionCommand.guildId, interactionCommand.member.id, flag === 'true');

					// if opted-out delete user from databases
					if (flag !== 'true') clearUserFromDb(interactionCommand.guildId, interactionCommand.member.id);
				}
				else if (interactionButton.customId === 'cancel') {
					await interactionCommand.editReply({ components: [confirmationButtons(false)] });
					await interactionButton.followUp({
						content: `Canceled opt-${flag === 'true' ? 'in' : 'out'}.`,
						ephemeral: true,
					});
				}
			})
			.catch(console.error);
	},
};
