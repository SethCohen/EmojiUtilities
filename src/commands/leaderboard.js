import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { sendErrorFeedback, verifyEmojiString } from '../helpers/utilities.js';
import { getLeaderboard } from '../helpers/mongodbModel.js';

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

const createOutput = async (interaction, emoji, date, array) => {
  const embed = new EmbedBuilder()
    .setTitle(`${emoji.name} Leaderboard`)
    .setDescription(date.dateString)
    .setThumbnail(emoji.imageURL());

  let leaderboardPos = 1;
  for (const row of array) {
    const count = Object.values(row)[1];
    const userId = Object.values(row)[0];
    try {
      const user = await interaction.guild.members.fetch(userId);
      embed.addFields({ name: `${leaderboardPos}. ${user.displayName}`, value: `${count}` });
    } catch (e) {
      console.error(`createOutput error\n${e}`);
    }
    leaderboardPos++;
  }

  return embed;
};

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription("Displays the top users for a specified emote's usage.")
    .addStringOption(option =>
      option.setName('type')
        .setDescription('The type of leaderboard to display.')
        .setRequired(true)
        .addChoices(
          { name: 'Sent', value: 'sent' },
          { name: 'Received', value: 'received' }
        )
    )
    .addStringOption(option =>
      option.setName('emoji')
        .setDescription('The emoji to get the leaderboard for.')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('daterange')
        .setDescription('The date range to query for.')
        .addChoices(
          { name: 'All Time', value: 0 },
          { name: 'Yearly', value: 365 },
          { name: 'Monthly', value: 30 },
          { name: 'Weekly', value: 7 },
          { name: 'Daily', value: 1 },
          { name: 'Hourly', value: 60 }
        )
    ),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const type = interaction.options.getString('type');
      const stringEmoji = interaction.options.getString('emoji');
      const dateRange = interaction.options.getInteger('daterange');
      const date = validateDateRange(dateRange);

      const verifiedEmoji = verifyEmojiString(stringEmoji);
      if (!verifiedEmoji) {
        return await interaction.editReply({
          embeds: [sendErrorFeedback(interaction.commandName, 'No emoji found in `emoji`.')],
        });
      }

      const emoji = await interaction.guild.emojis.fetch(verifiedEmoji[3]);

      const data = await getLeaderboard(
        interaction.client.db,
        interaction.guild.id,
        emoji.id,
        interaction.client.id,
        type,
        date.dateValue
      );

      if (!data.length) {
        return await interaction.editReply({
          embeds: [sendErrorFeedback(interaction.commandName, "Sorry, there's no info to display!\nThe leaderboard is empty!")],
        });
      }

      const embed = await createOutput(interaction, emoji, date, data);
      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      const errMsg = error.message;

      if (errMsg.includes('Unknown Emoji')) {
        await interaction.editReply({
          embeds: [sendErrorFeedback(interaction.commandName, 'Emoji found in `emoji` is not from this server.')],
        });
      } else {
        console.error(`Command:\n${interaction.commandName}\nError:\n${error.stack}\nRaw Input:\n${interaction.options.getString('type')}\n${interaction.options.getString('emoji')}\n${interaction.options.getInteger('daterange')}`);
        await interaction.editReply({
          embeds: [sendErrorFeedback(interaction.commandName)],
        });
      }
    }
  },
};
