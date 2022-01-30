const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

const navigationButtons = (state) => {
	return new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId('prev')
				.setLabel('👈 Prev')
				.setStyle('SECONDARY')
				.setDisabled(state),
			new MessageButton()
				.setCustomId('next')
				.setLabel('👉 Next')
				.setStyle('SECONDARY')
				.setDisabled(state),
		);
};

const createEmojisList = (interaction) => {
	const unpaginatedEmojsList = [...interaction.guild.emojis.cache.map(emoji => emoji.toString()).values()];
	const emojisPerPage = 27;
	const pages = [];
	for (let pageIndex = 0, emojisListIndex = unpaginatedEmojsList.length; pageIndex < emojisListIndex; pageIndex += emojisPerPage) {
		const page = unpaginatedEmojsList.slice(pageIndex, pageIndex + emojisPerPage).join(' ');
		pages.push(page);
	}
	pages.push(`This server has a total of ${unpaginatedEmojsList.length} emojis.`);

	return pages;
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('listemojis')
		.setDescription('Displays all usable emotes to chat.'),
	async execute(interactionCommand) {
		await interactionCommand.deferReply();

		const pages = createEmojisList(interactionCommand);
		let currentPageIndex = 0;

		await interactionCommand.editReply({
			content: pages[currentPageIndex],
			components: [navigationButtons(false)],
		});

		// Create button listeners
		const message = await interactionCommand.fetchReply();
		const collector = message.createMessageComponentCollector({ time: 30000 });
		collector.on('collect', async interactionButton => {
			if (interactionButton.member === interactionCommand.member) {
				if (interactionButton.customId === 'next' && currentPageIndex < pages.length - 1) {
					++currentPageIndex;
					await interactionButton.update({ content: pages[currentPageIndex] });
				}
				else if (interactionButton.customId === 'prev' && currentPageIndex > 0) {
					--currentPageIndex;
					await interactionButton.update({ content: pages[currentPageIndex] });
				}
				else {
					await interactionButton.reply({ content: 'No valid page to go to.', ephemeral: true });
				}
			}
			else {
				await interactionButton.reply({
					content: 'You can\'t interact with this button. You are not the command author.',
					ephemeral: true,
				});
			}
		});
		// eslint-disable-next-line no-unused-vars
		collector.on('end', collected => {
			interactionCommand.editReply({ components: [navigationButtons(true)] });
			// console.log(`Collected ${collected.size} interactions.`);
		});
	},
};
