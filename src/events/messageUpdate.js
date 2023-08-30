import { Events } from 'discord.js';
import {
  getGuildInfo,
  addEmojiRecords,
  deleteEmojiRecords,
  insertGuild,
} from '../helpers/mongodbModel.js';
import {
  createEmojiRecord,
  extractEmojis,
  getUserOpt,
  shouldProcessMessage,
} from '../helpers/utilities.js';

async function processEmojis(message, action) {
  const guildId = message.guildId;
  const messageAuthorId = message.author.id;
  const emojis = extractEmojis(message);
  const emojiRecords = [];

  for (const emoji of emojis) {
    const guildEmoji = await message.guild.emojis.fetch(emoji[3]).catch(() => null);
    if (!guildEmoji) continue;
    const emojiRecord = createEmojiRecord(
      guildId,
      message.id,
      guildEmoji.id,
      messageAuthorId,
      message.createdAt,
      'message'
    );
    emojiRecords.push(emojiRecord);
  }

  if (emojiRecords.length === 0) return false;

  if (action === 'add') {
    await addEmojiRecords(message.client.db, emojiRecords);
  } else if (action === 'delete') {
    const deleteFilter = { $or: emojiRecords };
    await deleteEmojiRecords(message.client.db, deleteFilter);
  }
}

async function processMessageUpdate(oldMessage, newMessage) {
  if(newMessage.partial) await newMessage.fetch();

  const guildInfo = await getGuildInfo(newMessage.client.db, newMessage.guild);
  const userOpt = await getUserOpt(guildInfo, newMessage.author.id);

  if (shouldProcessMessage(oldMessage, guildInfo, userOpt)) {
    await processEmojis(oldMessage, 'delete');
  }

  if (shouldProcessMessage(newMessage, guildInfo, userOpt)) {
    await processEmojis(newMessage, 'add');
  }
}

export default {
  name: Events.MessageUpdate,
  async execute(oldMessage, newMessage) {
    try {
      await processMessageUpdate(oldMessage, newMessage);
    } catch (error) {
      if (error.message == `Cannot read properties of null (reading 'usersOpt')`) {
        await insertGuild(newMessage.client.db, newMessage.guild);
      } else {
        console.error(Events.MessageUpdate, error);
      }
    }
  },
};
