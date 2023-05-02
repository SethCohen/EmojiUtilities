import { Events } from 'discord.js';
import { getGuildInfo, deleteEmojiRecords, insertGuild } from '../helpers/mongodbModel.js';
import {
  extractEmojis,
  getUserOpt,
  isMessagePartial,
  shouldProcessMessage,
  shouldProcessReaction,
} from '../helpers/utilities.js';

async function processEmojis(message, guildInfo) {
  if (isMessagePartial(message)) return false;
  const emojis = extractEmojis(message);
  let guildEmojiDetected = false;

  for (const emoji of emojis) {
    const guildEmoji = await message.guild.emojis.fetch(emoji[3]).catch(() => null);
    if (!guildEmoji) continue;
    guildEmojiDetected = true;
    break;
  }

  const users = [];
  const tags = [];

  const messageUserOpt = await getUserOpt(guildInfo, message.author.id);
  if (shouldProcessMessage(message, guildInfo, messageUserOpt)) {
    users.push(message.author.id);
    tags.push('message');
  }

  const guildEmojiMessageReactions = message.reactions.cache.filter((reaction) =>
    message.guild.emojis.resolve(reaction.emoji)
  );

  if (guildEmojiMessageReactions.size > 0) {
    guildEmojiDetected = true;

    if (shouldProcessReaction(guildEmojiMessageReactions.first(), guildInfo, messageUserOpt)) {
      users.push(message.author.id);
      tags.push('received-reaction');
    }

    for (const messageReaction of guildEmojiMessageReactions.values()) {
      for (const reactionUser of messageReaction.users.cache.values()) {
        const reactionUserOpt = await getUserOpt(guildInfo, reactionUser.id);
        if (shouldProcessReaction(messageReaction, guildInfo, reactionUserOpt)) {
          users.push(reactionUser.id);
          tags.push('sent-reaction');
        }
      }
    }
  }

  const filter = {
    guild: message.guildId,
    message: message.id,
    user: { $in: users },
    tag: { $in: tags },
  };

  if (!guildEmojiDetected) return false;

  await deleteEmojiRecords(message.client.db, filter);
}

async function processMessageDelete(message) {
  const guildInfo = await getGuildInfo(message.client.db, message.guildId);
  await processEmojis(message, guildInfo);
}

export default {
  name: Events.MessageDelete,
  async execute(message) {
    try {
      await processMessageDelete(message);
    } catch (error) {
      if (error.message == `Cannot read properties of null (reading 'usersOpt')`) {
        await insertGuild(message.client.db, message.guild);
      } else {
        console.error(Events.MessageDelete, error);
      }
    }
  },
};

export { processMessageDelete };
