import { createDatabase, deleteFromDb, getOpt } from '../helpers/dbModel.js';
import { getSettings } from '../helpers/dbModel.js';

export default {
	name: 'messageReactionRemoveAll',
	async execute(message, reactions) {
		// Ignore partials
		if (message.partial) return false;
		// Ignore invalid messages
		if (message.author === null) return false;
		// Ignore client
		if (message.author.id === message.client.user.id) return false;

		try {
			for (const reaction of reactions.values()) {
				for (const user of reaction.users.cache.values()) {
					const guildId = message.guildId;
					const reactionAuthorId = user.id;
					const messageAuthorId = message.author.id;
					const dateTime = message.createdAt.toISOString();

					// Check server flag for if counting reactions for emoji usage is allowed
					const serverFlags = await getSettings(guildId);
					if (!serverFlags.countreacts) return false;

					// p -> q       Don't pass if message author is reaction user AND countselfreacts flag is false
					// Check server flag for if counting self-reacts for emoji usage is allowed
					if (!(messageAuthorId === reactionAuthorId) || serverFlags.countselfreacts) {
						const guildEmoji = await message.guild.emojis.fetch(reaction.emoji.id);
						const messageUserOpt = await getOpt(guildId, messageAuthorId);
						const reactionUserOpt = await getOpt(guildId, reactionAuthorId);

						if (messageUserOpt) await deleteFromDb(guildId, guildEmoji.id, messageAuthorId, dateTime, 'reactsReceivedActivity', 'messageReactionRemove');
						if (reactionUserOpt) await deleteFromDb(guildId, guildEmoji.id, reactionAuthorId, dateTime, 'reactsSentActivity', 'messageReactionRemove');
					}
				}
			}
		}
		catch (e) {
			if (e.message === 'no such table: serverSettings') {
				await createDatabase(message.guildId);
			}
			else {
				console.error('messageReactionRemoveAll failed', e);
			}
		}
	},
};