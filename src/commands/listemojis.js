import { navigationButtons } from '../helpers/utilities.js';
import { SlashCommandBuilder } from 'discord.js';

const createEmojisList = (interaction) => {
  const emojisList = [...interaction.guild.emojis.cache.map(emoji => emoji.toString()).values()];
  const emojisPerPage = 27;
  const pages = [];

  for (let i = 0; i < emojisList.length; i += emojisPerPage) {
    pages.push(emojisList.slice(i, i + emojisPerPage).join(' '));
  }

  pages.push(`This server has a total of ${emojisList.length} emojis.`);
  return pages;
};

export default {
  data: new SlashCommandBuilder()
    .setName('listemojis')
    .setDescription('Displays all usable emotes to chat.'),

  async execute(interaction) {
    await interaction.deferReply();

    const pages = createEmojisList(interaction);
    let currentPageIndex = 0;

    await interaction.editReply({
      content: pages[currentPageIndex],
      components: [navigationButtons(true)],
    });

    const message = await interaction.fetchReply();
    const collector = message.createMessageComponentCollector({ time: 30000 });

    collector.on('collect', async button => {
      if (button.user.id !== interaction.user.id) {
        await button.reply({
          content: "You can't interact with this button. You are not the command author.",
          ephemeral: true,
        });
        return;
      }

      currentPageIndex = button.customId === 'next'
        ? (currentPageIndex + 1) % pages.length
        : (currentPageIndex - 1 + pages.length) % pages.length;

      await button.update({ content: pages[currentPageIndex] });
    });

    collector.on('end', async () => {
      try {
        await interaction.editReply({
          components: [navigationButtons(false)],
        });
      } catch (error) {
        if (error.message !== 'Unknown Message') {
          console.error(`Command:\n${interaction.commandName}\nError:\n${error.stack}`);
        }
      }
    });
  },
};
