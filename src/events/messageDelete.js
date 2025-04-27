import { Events } from 'discord.js';
import { getGuildInfo, deleteEmojiRecords, insertGuild } from '../helpers/mongodbModel.js';
import {
  extractEmojis,
  getUserOpt,
  isMessagePartial,
  shouldProcessMessage,
  shouldProcessReaction,
} from '../helpers/utilities.js';

const processEmojis = async (message, guildInfo) => {
  if (isMessagePartial(message)) return false;

  const emojis = extractEmojis(message);
  if (!emojis.length) return false;

  const users = new Set();
  const tags = new Set();
  let guildEmojiDetected = false;

  // Check if message itself used guild emojis
  for (const [, , , emojiId] of emojis) {
    const guildEmoji = await message.guild.emojis.fetch(emojiId).catch(() => null);
    if (guildEmoji) {
      guildEmojiDetected = true;
      break;
    }
  }

  // Process message author
  const messageUserOpt = await getUserOpt(guildInfo, message.author.id);
  if (shouldProcessMessage(message, guildInfo, messageUserOpt)) {
    users.add(message.author.id);
    tags.add('message');
  }

  // Process message reactions
  const guildReactions = message.reactions.cache.filter((reaction) =>
    message.guild.emojis.resolve(reaction.emoji)
  );

  if (guildReactions.size > 0) {
    guildEmojiDetected = true;

    if (shouldProcessReaction(guildReactions.first(), guildInfo, messageUserOpt)) {
      users.add(message.author.id);
      tags.add('received-reaction');
    }

    for (const reaction of guildReactions.values()) {
      for (const user of reaction.users.cache.values()) {
        const reactionUserOpt = await getUserOpt(guildInfo, user.id);
        if (shouldProcessReaction(reaction, guildInfo, reactionUserOpt)) {
          users.add(user.id);
          tags.add('sent-reaction');
        }
      }
    }
  }

  if (!guildEmojiDetected) return false;

  const filter = {
    guild: message.guildId,
    message: message.id,
    user: { $in: [...users] },
    tag: { $in: [...tags] },
  };

  await deleteEmojiRecords(message.client.db, filter);
};

const processMessageDelete = async (message) => {
  const guildInfo = await getGuildInfo(message.client.db, message.guild);
  await processEmojis(message, guildInfo);
};

export default {
  name: Events.MessageDelete,
  async execute(message) {
    try {
      await processMessageDelete(message);
    } catch (error) {
      if (error.message === `Cannot read properties of null (reading 'usersOpt')`) {
        console.warn(`Guild data missing for ${message.guild?.name} (${message.guildId}). Reinserting...`);
        await insertGuild(message.client.db, message.guild);
      } else {
        console.error(`Error in ${Events.MessageDelete}:`, error);
      }
    }
  },
};

export { processMessageDelete };
