import { Events } from 'discord.js';
import { addEmojiRecord, getGuildInfo, insertGuild } from '../helpers/mongodbModel.js';
import {
  createEmojiRecord,
  fetchReactionPartials,
  getUserOpt,
  isDifferentAuthor,
  isTrackingSelfReacts,
  shouldProcessReaction,
} from '../helpers/utilities.js';

const processReaction = async (messageReaction, userId, tag) => {
  const guildEmoji = await messageReaction.message.guild.emojis
    .fetch(messageReaction.emoji.id)
    .catch(() => null);

  if (!guildEmoji) return false;

  const emojiRecord = createEmojiRecord(
    messageReaction.message.guildId,
    messageReaction.message.id,
    guildEmoji.id,
    userId,
    messageReaction.message.createdAt,
    tag
  );

  await addEmojiRecord(messageReaction.client.db, emojiRecord);
};

const processMessageReactionAdd = async (messageReaction, user) => {
  await fetchReactionPartials(messageReaction);

  const { client, message } = messageReaction;
  const guildInfo = await getGuildInfo(client.db, message.guild);

  const reactionAuthorId = user.id;
  const messageAuthorId = message.author.id;

  if (!isDifferentAuthor(messageAuthorId, reactionAuthorId) && !isTrackingSelfReacts(guildInfo)) {
    return;
  }

  const messageUserOpt = getUserOpt(guildInfo, messageAuthorId);
  const reactionUserOpt = getUserOpt(guildInfo, reactionAuthorId);

  if (shouldProcessReaction(messageReaction, guildInfo, messageUserOpt)) {
    await processReaction(messageReaction, messageAuthorId, 'received-reaction');
  }

  if (shouldProcessReaction(messageReaction, guildInfo, reactionUserOpt)) {
    await processReaction(messageReaction, reactionAuthorId, 'sent-reaction');
  }
};

export default {
  name: Events.MessageReactionAdd,
  async execute(messageReaction, user) {
    try {
      await processMessageReactionAdd(messageReaction, user);
    } catch (error) {
      if (error.message === `Cannot read properties of null (reading 'usersOpt')`) {
        console.warn(`Guild data missing for ${messageReaction.message.guild?.name} (${messageReaction.message.guildId}). Reinserting...`);
        await insertGuild(messageReaction.client.db, messageReaction.message.guild);
      } else {
        console.error(`Error in ${Events.MessageReactionAdd}:`, error);
      }
    }
  },
};
