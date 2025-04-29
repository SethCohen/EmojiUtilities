import { Events } from 'discord.js';
import { getGuildInfo, addEmojiRecords, deleteEmojiRecords, insertGuild } from '../helpers/mongodbModel.js';
import { createEmojiRecord, extractEmojis, getUserOpt, shouldProcessMessage } from '../helpers/utilities.js';

const tally = ids =>
  ids.reduce((acc, id) => { acc[id] = (acc[id] || 0) + 1; return acc; }, {});

const diffList = (fromCount, toCount) =>
  Object.entries(fromCount)
    .flatMap(([id, cnt]) =>
      Array(Math.max(cnt - (toCount[id] || 0), 0)).fill(id)
    );

const fetchEmoji = (guild, id) =>
  guild.emojis.cache.get(id) || guild.emojis.fetch(id).catch(() => null);

async function addEmojis(db, guild, message, ids) {
  if (!ids.length) return;
  const records = (
    await Promise.all(
      ids.map(async id => {
        const emoji = await fetchEmoji(guild, id);
        return emoji && createEmojiRecord(
          message.guildId,
          message.id,
          emoji.id,
          message.author.id,
          message.createdAt,
          'message'
        );
      })
    )
  ).filter(Boolean);
  if (records.length) await addEmojiRecords(db, records);
}

async function removeEmojis(db, guild, message, ids) {
  if (!ids.length) return;
  const records = (
    await Promise.all(
      ids.map(async id => {
        const emoji = await fetchEmoji(guild, id);
        return emoji && createEmojiRecord(
          message.guildId,
          message.id,
          emoji.id,
          message.author.id,
          message.createdAt,
          'message'
        );
      })
    )
  ).filter(Boolean);
  if (records.length) await deleteEmojiRecords(db, { $or: records });
}

export default {
  name: Events.MessageUpdate,
  async execute(oldMessage, newMessage) {
    try {
      if (newMessage.partial) await newMessage.fetch();
      const { client, guild, author } = newMessage;
      const guildInfo = await getGuildInfo(client.db, guild);
      const userOpt = await getUserOpt(guildInfo, author.id);

      const oldIds =
        shouldProcessMessage(oldMessage, guildInfo, userOpt)
          ? extractEmojis(oldMessage).map(e => e[3])
          : [];
      const newIds =
        shouldProcessMessage(newMessage, guildInfo, userOpt)
          ? extractEmojis(newMessage).map(e => e[3])
          : [];

      const toAdd = diffList(tally(newIds), tally(oldIds));
      const toRemove = diffList(tally(oldIds), tally(newIds));

      await Promise.all([
        addEmojis(client.db, guild, newMessage, toAdd),
        removeEmojis(client.db, guild, newMessage, toRemove)
      ]);
    } catch (error) {
      if (error.message.includes('usersOpt')) {
        await insertGuild(newMessage.client.db, newMessage.guild);
      } else {
        console.error(Events.MessageUpdate, error);
      }
    }
  }
};
