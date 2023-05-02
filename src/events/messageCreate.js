import { Events } from 'discord.js';
import { getGuildInfo, addEmojiRecords, insertGuild } from '../helpers/mongodbModel.js';
import {
  createEmojiRecord,
  extractEmojis,
  getUserOpt,
  shouldProcessMessage,
} from '../helpers/utilities.js';

async function processEmojis(message) {
  const emojis = extractEmojis(message);

  const emojiRecords = [];
  for (const emoji of emojis) {
    const guildEmoji = await message.guild.emojis.fetch(emoji[3]).catch(() => null);
    if (!guildEmoji) continue;
    const emojiRecord = createEmojiRecord(
      message.guildId,
      message.id,
      guildEmoji.id,
      message.author.id,
      message.createdAt,
      'message'
    );

    emojiRecords.push(emojiRecord);
  }

  if (emojiRecords.length === 0) return false;

  await addEmojiRecords(message.client.db, emojiRecords);
}

async function processMessageCreate(message) {
  const guildInfo = await getGuildInfo(message.client.db, message.guildId);
  const userOpt = await getUserOpt(guildInfo, message.author.id);

  if (shouldProcessMessage(message, guildInfo, userOpt)) {
    await processEmojis(message, guildInfo);
  }
}

export default {
  name: Events.MessageCreate,
  async execute(message) {
    try {
      await processMessageCreate(message);
    } catch (error) {
      if (error.message == `Cannot read properties of null (reading 'usersOpt')`) {
        await insertGuild(message.client.db, message.guild);
      } else {
        console.error(Events.MessageCreate, error);
      }
    }
  },
};
