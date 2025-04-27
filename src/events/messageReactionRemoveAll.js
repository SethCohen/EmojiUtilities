import { Events } from 'discord.js';
import { processMessageReactionRemove } from './messageReactionRemove.js';
import { getUserOpt, shouldProcessReaction } from '../helpers/utilities.js';
import { deleteEmojiRecords, getGuildInfo, insertGuild } from '../helpers/mongodbModel.js';

const processMessageReactionRemoveAll = async (message, reactions) => {
  const guildInfo = await getGuildInfo(message.client.db, message.guild);
  const messageUserOpt = await getUserOpt(guildInfo, message.author.id);

  // Process individual reactions
  for (const reaction of reactions.values()) {
    for (const user of reaction.users.cache.values()) {
      await processMessageReactionRemove(reaction, user);
    }
  }

  const users = new Set();
  const tags = ['sent-reaction', 'received-reaction'];

  const guildReactions = reactions.filter((reaction) =>
    message.guild.emojis.resolve(reaction.emoji)
  );

  for (const reaction of guildReactions.values()) {
    for (const user of reaction.users.cache.values()) {
      const reactionUserOpt = await getUserOpt(guildInfo, user.id);
      if (shouldProcessReaction(reaction, guildInfo, reactionUserOpt)) {
        users.add(user.id);
      }
    }

    if (shouldProcessReaction(reaction, guildInfo, messageUserOpt)) {
      users.add(message.author.id);
    }
  }

  if (users.size > 0) {
    const filter = {
      guild: message.guildId,
      message: message.id,
      user: { $in: [...users] },
      tag: { $in: tags },
    };
    await deleteEmojiRecords(message.client.db, filter);
  }
};

export default {
  name: Events.MessageReactionRemoveAll,
  async execute(message, reactions) {
    try {
      await processMessageReactionRemoveAll(message, reactions);
    } catch (error) {
      if (error.message === `Cannot read properties of null (reading 'usersOpt')`) {
        console.warn(`Guild data missing for ${message.guild?.name} (${message.guildId}). Reinserting...`);
        await insertGuild(message.client.db, message.guild);
      } else {
        console.error(`Error in ${Events.MessageReactionRemoveAll}:`, error);
      }
    }
  },
};
