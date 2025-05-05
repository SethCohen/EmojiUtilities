import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { mediaLinks } from './constants.js';

function verifyEmojiString(input) {
  const re = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/;
  return input.match(re);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function sendErrorFeedback(title, error = null) {
  const unknownError =
    "Unknown Error Found! Don't worry, the error was logged to the bot owner. A fix should be released soon. Thank you! 🙂";

  return new EmbedBuilder()
    .setTitle(`${capitalizeFirstLetter(title)} Error!`)
    .setDescription(
      `**${
        error ? error : unknownError
      }**\n\nThink this error wasn't supposed to happen?\nTry joining our [support server](https://discord.gg/XaeERFAVfb) for help!`
    );
}

const navigationButtons = (isEnabled) => {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('prev')
      .setLabel('👈 Prev')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(!isEnabled),
    new ButtonBuilder()
      .setCustomId('next')
      .setLabel('👉 Next')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(!isEnabled)
  );
};

const confirmationButtons = (isEnabled) => {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('confirm')
      .setLabel('✔ Confirm')
      .setStyle(ButtonStyle.Success)
      .setDisabled(!isEnabled),
    new ButtonBuilder()
      .setCustomId('cancel')
      .setLabel('❌ Cancel')
      .setStyle(ButtonStyle.Danger)
      .setDisabled(!isEnabled)
  );
};

function isMessageAuthorClient(message) {
  return message.author.id === message.client.user.id;
}

function isNotTrackingMessages(guildInfo) {
  return !guildInfo.settings.countmessages;
}

function isUserOptedOut(userOpt) {
  return userOpt && userOpt.flag == false;
}

function isMessagePartial(message) {
  return message.partial;
}

async function getUserOpt(guildInfo, userId) {
  return guildInfo.usersOpt.find((element) => element.user === userId);
}

function extractEmojis(message) {
  if (!message?.content) return [];
  const re = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/g;
  return [...message.content.matchAll(re)];
}

function isMessageAuthorNull(message) {
  return message.author === null;
}

function createEmojiRecord(guildId, messageId, emojiId, userId, date, tag) {
  return {
    guild: guildId,
    message: messageId,
    emoji: emojiId,
    user: userId,
    date: date,
    tag: tag,
  };
}

function shouldProcessMessage(message, guildInfo, userOpt) {
  if (isNotTrackingMessages(guildInfo)) return false;
  if (isUserOptedOut(userOpt)) return false;
  if (isMessagePartial(message)) return false;
  if (isMessageAuthorClient(message)) return false;
  if (isMessageAuthorNull(message)) return false;
  return true;
}

function shouldProcessReaction(messageReaction, guildInfo, userOpt) {
  if (isNotTrackingReacts(guildInfo)) return false;
  if (isUserOptedOut(userOpt)) return false;
  if (isUnicodeEmoji(messageReaction)) return false;
  return true;
}

function isUnicodeEmoji(messageReaction) {
  return !messageReaction.emoji.id;
}

function isNotTrackingReacts(serverFlags) {
  return !serverFlags.settings.countreacts;
}

async function fetchReactionPartials(messageReaction) {
  if (messageReaction.partial) {
    await messageReaction.fetch();
  }
  if (messageReaction.message.partial) {
    await messageReaction.message.fetch();
  }
}
function isDifferentAuthor(messageAuthorId, reactionAuthorId) {
  return !(messageAuthorId === reactionAuthorId);
}

function isTrackingSelfReacts(guildInfo) {
  return guildInfo.settings.countselfreacts;
}

export const createSupportMessage = (client) => {
  const monthlyPrice = 16.05;
  const createdDate = client.user.createdAt;
  const now = new Date();

  const totalMonths =
      (now.getFullYear() - createdDate.getFullYear()) * 12 +
      (now.getMonth() - createdDate.getMonth());

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const totalSpent = totalMonths * monthlyPrice;

  const durationText =
      years > 0
          ? `${years} year${years !== 1 ? 's' : ''}${months > 0 ? ` and ${months} month${months !== 1 ? 's' : ''}` : ''}`
          : `${months} month${months !== 1 ? 's' : ''}`;

  const description =
      `Hi there! I'm a solo developer, and this bot is a passion project funded entirely out of my own pocket.\n\n` +
      `For full transparency, it's been running for **${durationText}**, during which I've personally spent over **$${totalSpent.toFixed(2)} CAD** to keep it online at **$${monthlyPrice}/month**.\n\n` +
      `If you've enjoyed using it, please consider supporting its development. Your help keeps the bot running and growing! 🙂\n\n` +
      mediaLinks;

  return new EmbedBuilder()
      .setColor("#82b6e0")
      .setTitle('Enjoying the bot?')
      .setDescription(description)
      .setFooter({ text: 'Thank you for your support! 💖' });
};

export {
  isDifferentAuthor,
  isTrackingSelfReacts,
  sendErrorFeedback,
  verifyEmojiString,
  navigationButtons,
  confirmationButtons,
  isMessageAuthorClient,
  isNotTrackingMessages,
  isUserOptedOut,
  getUserOpt,
  extractEmojis,
  isMessagePartial,
  isMessageAuthorNull,
  createEmojiRecord,
  shouldProcessMessage,
  shouldProcessReaction,
  fetchReactionPartials,
  isNotTrackingReacts,
};
