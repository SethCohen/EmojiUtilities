import { Events } from 'discord.js';
import { processMessageReactionRemove } from './messageReactionRemove.js';
import { getUserOpt, shouldProcessReaction } from '../helpers/utilities.js';
import { deleteEmojiRecords, getGuildInfo, insertGuild } from '../helpers/mongodbModel.js';

async function processMessageReactionRemoveAll(message, reactions) {
  const guildInfo = await getGuildInfo(message.client.db, message.guildId);
  const messageUserOpt = await getUserOpt(guildInfo, message.author.id);

  for (const reaction of reactions.values()) {
    for (const user of reaction.users.cache.values()) {
      processMessageReactionRemove(reaction, user);
    }
  }

  const users = [];
  const tags = ['sent-reaction', 'received-reaction'];

  const guildEmojiMessageReactions = reactions.filter((reaction) =>
    message.guild.emojis.resolve(reaction.emoji)
  );

  for (const messageReaction of guildEmojiMessageReactions.values()) {
    for (const reactionUser of messageReaction.users.cache.values()) {
      const reactionUserOpt = await getUserOpt(guildInfo, reactionUser.id);
      if (shouldProcessReaction(messageReaction, guildInfo, reactionUserOpt)) {
        users.push(reactionUser.id);
        tags.push('sent-reaction');
      }
      if (shouldProcessReaction(messageReaction, guildInfo, messageUserOpt)) {
        users.push(message.author.id);
        tags.push('received-reaction');
      }
    }
  }

  const filter = {
    guild: message.guildId,
    message: message.id,
    user: { $in: users },
    tag: { $in: tags },
  };

  await deleteEmojiRecords(message.client.db, filter);
}

export default {
  name: Events.MessageReactionRemoveAll,
  async execute(message, reactions) {
    try {
      await processMessageReactionRemoveAll(message, reactions);
    } catch (error) {
      if (error.message == `Cannot read properties of null (reading 'usersOpt')`) {
        await insertGuild(message.client.db, message.guild);
      } else {
        console.error(Events.MessageReactionRemoveAll, error);
      }
    }
  },
};
