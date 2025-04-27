import { Events } from 'discord.js';
import { getGuildInfo, addEmojiRecords, insertGuild } from '../helpers/mongodbModel.js';
import { createEmojiRecord, extractEmojis, getUserOpt, shouldProcessMessage } from '../helpers/utilities.js';

const processEmojis = async (message) => {
  const emojis = extractEmojis(message);
  if (!emojis.length) return false;


  // Batch-fetch all server emojis once
  const emojiCache = await message.guild.emojis.fetch().catch(() => null);
  if (!emojiCache) {
    console.warn(`Could not fetch emojis for guild ${message.guild?.name}.`);
    return false;
  }

  const emojiRecords = emojis
    .map((emoji) => {
      const emojiId = emoji[3];
      const guildEmoji = emojiCache.get(emojiId);
      if (!guildEmoji) return null;

      return createEmojiRecord(
        message.guildId,
        message.id,
        guildEmoji.id,
        message.author.id,
        message.createdAt,
        'message'
      );
    })
    .filter(Boolean);

  if (!emojiRecords.length) return false;

  await addEmojiRecords(message.client.db, emojiRecords);
};

const processMessageCreate = async (message) => {
  const guildInfo = await getGuildInfo(message.client.db, message.guild);
  const userOpt = await getUserOpt(guildInfo, message.author.id);

  if (shouldProcessMessage(message, guildInfo, userOpt)) {
    await processEmojis(message);
  }
};

export default {
  name: Events.MessageCreate,
  async execute(message) {
    try {
      await processMessageCreate(message);
    } catch (error) {
      if (error.message === `Cannot read properties of null (reading 'usersOpt')`) {
        console.warn(`Guild data missing for ${message.guild?.name} (${message.guildId}). Reinserting...`);
        await insertGuild(message.client.db, message.guild);
      } else {
        console.error(`Error in ${Events.MessageCreate}:`, error);
      }
    }
  },
};
