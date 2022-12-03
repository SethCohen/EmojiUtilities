import { navigationButtons } from '../helpers/utilities.js';
import { SlashCommandBuilder } from 'discord.js';

const createEmojisList = (interaction) => {
	const emojisList = [...interaction.guild.emojis.cache.map(emoji => emoji.toString()).values()];
	const emojisPerPage = 27;
	const pages = [];
	for (let pageIndex = 0, emojisListIndex = emojisList.length; pageIndex < emojisListIndex; pageIndex += emojisPerPage) {
		const page = emojisList.slice(pageIndex, pageIndex + emojisPerPage).join(' ');
		pages.push(page);
	}
	pages.push(`This server has a total of ${emojisList.length} emojis.`);

	return pages;
};

export default {
	data: new SlashCommandBuilder()
		.setName('listemojis')
		.setDescription('Displays all usable emotes to chat.'),
	async execute(interactionCommand) {
		await interactionCommand.deferReply();

		const pages = createEmojisList(interactionCommand);
		let currentPageIndex = 0;

		await interactionCommand.editReply({
			content: pages[currentPageIndex],
			components: [navigationButtons(true)],
		});

		// Create button listeners
		const message = await interactionCommand.fetchReply();
		const collector = message.createMessageComponentCollector({ time: 30000 });
		collector.on('collect', async interactionButton => {
			if (interactionButton.member === interactionCommand.member) {
				if (interactionButton.customId === 'next' && currentPageIndex < pages.length - 1) {
					++currentPageIndex;
				}
				else if (interactionButton.customId === 'prev' && currentPageIndex > 0) {
					--currentPageIndex;
				}
				else if (currentPageIndex === 0) {
					currentPageIndex = pages.length - 1;
				}
				else if (currentPageIndex === pages.length - 1) {
					currentPageIndex = 0;
				}
				await interactionButton.update({ content: pages[currentPageIndex] });
			}
			else {
				await interactionButton.reply({
					content: 'You can\'t interact with this button. You are not the command author.',
					ephemeral: true,
				});
			}
		});
		// eslint-disable-next-line no-unused-vars
		collector.on('end', async collected => {
			try {
				await interactionCommand.editReply({ components: [navigationButtons(false)] });
			}
			catch (error) {
				switch (error.message) {
				case 'Unknown Message':
					// Ignore unknown interactions (Often caused from deleted interactions).
					break;
				default:
					console.error(`Command:\n${interactionCommand.commandName}\nError Message:\n${error.message}`);
				}
			}
			// console.log(`Collected ${collected.size} interactions.`);
		});
	},
};
