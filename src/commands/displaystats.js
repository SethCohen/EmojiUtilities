import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { navigationButtons, sendErrorFeedback } from '../helpers/utilities.js';
import { getDisplayStats } from '../helpers/mongodbModel.js';

const validateDateRange = (range) => {
  const now = new Date();
  switch (range) {
    case 0: return { dateString: 'All-Time', dateValue: '0' };
    case 365: now.setDate(now.getDate() - 365); return { dateString: 'Yearly', dateValue: now.toISOString() };
    case 30: now.setMonth(now.getMonth() - 1); return { dateString: 'Monthly', dateValue: now.toISOString() };
    case 7: now.setDate(now.getDate() - 7); return { dateString: 'Weekly', dateValue: now.toISOString() };
    case 1: now.setDate(now.getDate() - 1); return { dateString: 'Daily', dateValue: now.toISOString() };
    case 60: now.setHours(now.getHours() - 1); return { dateString: 'Hourly', dateValue: now.toISOString() };
    default: return { dateString: 'All-Time', dateValue: '0' };
  }
};

const getSortedOccurrences = (interaction, data) => {
  return interaction.guild.emojis.cache.map(emoji => {
    const item = data.find(row => row.emoji === emoji.id);
    return { emoji: emoji.id, count: item ? item.count : 0 };
  }).sort((a, b) => b.count - a.count);
};

const getPages = (user, date, interaction, occurrences) => {
  const chunkSize = 24;
  const chunks = [];
  for (let i = 0; i < occurrences.length; i += chunkSize) {
    chunks.push(occurrences.slice(i, i + chunkSize));
  }

  const embedPages = [];
  chunks.forEach((chunk, index) => {
    const embed = new EmbedBuilder()
      .setTitle(`---------- ${user ? user.username : 'Server'}'s Statistics ----------`)
      .setDescription(date.dateString)
      .setFooter({ text: `Page ${index + 1}/${chunks.length}` });

    for (const row of chunk) {
      const emoji = interaction.guild.emojis.cache.get(row.emoji);
      if (emoji) {
        embed.addFields({ name: `${emoji}`, value: `${row.count}`, inline: true });
      }
    }
    embedPages.push(embed);
  });

  return embedPages;
};

const setupPageNavigation = (interaction, message, pages) => {
  let currentPageIndex = 0;

  const collector = message.createMessageComponentCollector({ time: 30000 });

  collector.on('collect', async button => {
    if (button.user.id !== interaction.user.id) {
      await button.reply({ content: "You can't interact with this button.", ephemeral: true });
      return;
    }

    if (button.customId === 'next') {
      currentPageIndex = (currentPageIndex + 1) % pages.length;
    } else if (button.customId === 'prev') {
      currentPageIndex = (currentPageIndex - 1 + pages.length) % pages.length;
    }

    await button.update({ embeds: [pages[currentPageIndex]] });
  });

  collector.on('end', async () => {
    await interaction.editReply({ components: [navigationButtons(false)] });
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
      const { dateString, dateValue } = validateDateRange(range);

      const data = await getDisplayStats(
        interaction.client.db,
        interaction.guild.id,
        dateValue,
        user?.id
      );

      const occurrences = getSortedOccurrences(interaction, data);
      const pages = getPages(user, { dateString }, interaction, occurrences);

      if (!pages.length) {
        await interaction.editReply({ content: "Sorry, there's no info to display!" });
        return;
      }

      await interaction.editReply({
        embeds: [pages[0]],
        components: [navigationButtons(true)],
      });

      const message = await interaction.fetchReply();
      setupPageNavigation(interaction, message, pages);

    } catch (error) {
      console.error(`Command:\n${interaction.commandName}\nError:\n${error.stack}\nRaw Input:\n${interaction.options.getInteger('daterange')}\n${interaction.options.getUser('user')}`);
      await interaction.editReply({
        embeds: [sendErrorFeedback(interaction.commandName)],
      });
    }
  },
};
