import { Events } from 'discord.js';
import { deleteEmojiRecord, getGuildInfo, insertGuild } from '../helpers/mongodbModel.js';
import {
  createEmojiRecord,
  fetchReactionPartials,
  getUserOpt,
  isDifferentAuthor,
  isTrackingSelfReacts,
  shouldProcessReaction,
} from '../helpers/utilities.js';

async function processReactionRemoval(messageReaction, userId, tag) {
  const guildEmoji = await messageReaction.message.guild.emojis
    .fetch(messageReaction.emoji.id)
    .catch(() => null);

  if (!guildEmoji) return false;

  const emojiRecord = createEmojiRecord(
    messageReaction.message.guildId,
    messageReaction.message.id,
    messageReaction.emoji.id,
    userId,
    messageReaction.message.createdAt,
    tag
  );
  await deleteEmojiRecord(messageReaction.client.db, emojiRecord);
}

async function processMessageReactionRemove(messageReaction, user) {
  await fetchReactionPartials(messageReaction);

  const guildInfo = await getGuildInfo(messageReaction.client.db, messageReaction.message.guild);
  const reactionAuthorId = user.id;
  const messageAuthorId = messageReaction.message.author.id;

  if (isDifferentAuthor(messageAuthorId, reactionAuthorId) || isTrackingSelfReacts(guildInfo)) {
    const messageUserOpt = getUserOpt(guildInfo, messageAuthorId);
    const reactionUserOpt = getUserOpt(guildInfo, reactionAuthorId);

    if (shouldProcessReaction(messageReaction, guildInfo, messageUserOpt)) {
      await processReactionRemoval(messageReaction, messageAuthorId, 'received-reaction');
    }

    if (shouldProcessReaction(messageReaction, guildInfo, reactionUserOpt)) {
      await processReactionRemoval(messageReaction, reactionAuthorId, 'sent-reaction');
    }
  }
}

export default {
  name: Events.MessageReactionRemove,
  async execute(messageReaction, user) {
    try {
      await processMessageReactionRemove(messageReaction, user);
    } catch (error) {
      if (error.message == `Cannot read properties of null (reading 'usersOpt')`) {
        await insertGuild(messageReaction.client.db, messageReaction.message.guild);
      } else {
        console.error(Events.MessageReactionRemove, error);
      }
    }
  },
};

export { processMessageReactionRemove };
