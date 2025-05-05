import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { navigationButtons, sendErrorFeedback } from '../helpers/utilities.js';
import { getDisplayStats } from '../helpers/mongodbModel.js';

const validateDateRange = (range) => {
  const now = new Date();
  switch (range) {
    case 365: now.setDate(now.getDate() - 365); return { dateString: 'Yearly', dateValue: now.toISOString() };
    case 30: now.setMonth(now.getMonth() - 1); return { dateString: 'Monthly', dateValue: now.toISOString() };
    case 7: now.setDate(now.getDate() - 7); return { dateString: 'Weekly', dateValue: now.toISOString() };
    case 1: now.setDate(now.getDate() - 1); return { dateString: 'Daily', dateValue: now.toISOString() };
    case 60: now.setHours(now.getHours() - 1); return { dateString: 'Hourly', dateValue: now.toISOString() };
    case 0:
    default:
      return { dateString: 'All-Time', dateValue: '0' };
  }
};

const getSortedOccurrences = (interaction, data) => (
  interaction.guild.emojis.cache.map(emoji => {
    const item = data.find(row => row.emoji === emoji.id);
    return { emoji: emoji.id, count: item?.count || 0 };
  }).sort((a, b) => b.count - a.count)
);

const createPages = (user, rangeInfo, interaction, occurrences) => {
  const chunkSize = 24;
  const pages = [];

  for (let i = 0; i < occurrences.length; i += chunkSize) {
    const chunk = occurrences.slice(i, i + chunkSize);
    const embed = new EmbedBuilder()
      .setTitle(`---------- ${user ? user.username : 'Server'}'s Statistics ----------`)
      .setDescription(rangeInfo.dateString)
      .setFooter({ text: `Page ${pages.length + 1}/${Math.ceil(occurrences.length / chunkSize)}` });

    chunk.forEach(({ emoji, count }) => {
      const emojiObj = interaction.guild.emojis.cache.get(emoji);
      if (emojiObj) embed.addFields({ name: `${emojiObj}`, value: `${count}`, inline: true });
    });

    pages.push(embed);
  }

  return pages;
};

const createCollector = (interaction, message, pages) => {
  let currentPageIndex = 0;
  const collector = message.createMessageComponentCollector({ time: 30000 });

  collector.on('collect', async button => {
    if (button.user.id !== interaction.user.id) {
      return button.reply({ content: "You can't interact with this button.", ephemeral: true });
    }

    if (button.customId === 'next') {
      currentPageIndex = (currentPageIndex + 1) % pages.length;
    } else if (button.customId === 'prev') {
      currentPageIndex = (currentPageIndex - 1 + pages.length) % pages.length;
    }

    await button.update({ embeds: [pages[currentPageIndex]] });
  });

  collector.on('end', async () => {
    try {
      await interaction.editReply({ components: [navigationButtons(false)] });
    } catch (err) {
      if (err.code !== 10008) console.error('Failed to update message after collector ended:', err);
    }
  });
};

export default {
  data: new SlashCommandBuilder()
    .setName('displaystats')
    .setDescription('Displays all emote usages to chat.')
    .addIntegerOption(option =>
      option.setName('daterange')
        .setDescription('The date range to query for.')
        .setRequired(true)
        .addChoices(
          { name: 'All Time', value: 0 },
          { name: 'Yearly', value: 365 },
          { name: 'Monthly', value: 30 },
          { name: 'Weekly', value: 7 },
          { name: 'Daily', value: 1 },
          { name: 'Hourly', value: 60 }
        )
    )
    .addUserOption(option =>
      option.setName('user')
        .setDescription("The user to query for. Not specifying grabs server stats.")
    ),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const range = interaction.options.getInteger('daterange');
      const user = interaction.options.getUser('user');
      const rangeInfo = validateDateRange(range);

      const data = await getDisplayStats(
        interaction.client.db,
        interaction.guild.id,
        rangeInfo.dateValue,
        user?.id
      );

      const occurrences = getSortedOccurrences(interaction, data);
      const pages = createPages(user, rangeInfo, interaction, occurrences);

      if (!pages.length) {
        return await interaction.editReply({ content: "Sorry, there's no info to display!" });
      }

      await interaction.editReply({
        embeds: [pages[0]],
        components: [navigationButtons(true)],
      });

      const message = await interaction.fetchReply();
      createCollector(interaction, message, pages);

    } catch (error) {
      console.error(`Command: ${interaction.commandName}\nError:\n${error.stack}`);
      await interaction.editReply({
        embeds: [sendErrorFeedback(interaction.commandName)],
      }).catch(console.error); // in case editReply fails too
    }
  },
};
