import { insertToDb, getOpt, createDatabase } from '../helpers/dbModel.js';
import { getSettings } from '../helpers/dbModel.js';

export default {
	name: 'messageReactionAdd',
	async execute(messageReaction, user) {
		// Fetch any partials
		if (messageReaction.partial) {
			await messageReaction.fetch().catch(e => {
				// console.error('messageReactionAdd messageReaction.fetch() failed.', e);
				return false;
			});
		}
		if (messageReaction.message.partial) {
			await messageReaction.message.fetch().catch(e => {
				// console.error('messageReactionAdd messageReaction.message.fetch() failed.', e);
				return false;
			});
		}

		// Ignore invalid messages
		if (messageReaction.message.author === null) return false;
		// Ignore client
		if (messageReaction.me || messageReaction.message.author.id === messageReaction.client.user.id) return false;
		// Ignore default emojis
		if (!messageReaction.emoji.id) return false;

		try {
			const guildId = messageReaction.message.guildId;
			const reactionAuthorId = user.id;
			const messageAuthorId = messageReaction.message.author.id;
			const dateTime = messageReaction.message.createdAt.toISOString();

			// Check server flag for if counting reactions for emoji usage is allowed
			const serverFlags = await getSettings(guildId);
			if (!serverFlags.countreacts) return false;

			// p -> q       Don't pass if message author is reaction user AND countselfreacts flag is false
			// Check server flag for if counting self-reacts for emoji usage is allowed
			if (!(messageAuthorId === reactionAuthorId) || serverFlags.countselfreacts) {
				const guildEmoji = await messageReaction.message.guild.emojis.fetch(messageReaction.emoji.id);
				const messageUserOpt = await getOpt(guildId, messageAuthorId);
				const reactionUserOpt = await getOpt(guildId, reactionAuthorId);

				if (messageUserOpt) await insertToDb(guildId, guildEmoji.id, messageAuthorId, dateTime, 'reactsReceivedActivity', 'messageReactionAdd');
				if (reactionUserOpt) await insertToDb(guildId, guildEmoji.id, reactionAuthorId, dateTime, 'reactsSentActivity', 'messageReactionAdd');
			}
		}
		catch (e) {
			if (e.message === 'no such table: serverSettings') {
				await createDatabase(messageReaction.message.guildId);
			}
			else if (e.message === 'Unknown Emoji') {
				return false;
			}
			else {
				console.error('messageReactionAdd failed', e);
			}
		}

	},
};