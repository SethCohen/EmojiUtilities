import { createDatabase, deleteFromDb, getOpt } from '../helpers/dbModel.js';
import { getSettings } from '../helpers/dbModel.js';

export default {
	name: 'messageDeleteBulk',
	execute(messages) {
		messages.every(async message => {
			// Ignore partials
			if (message.partial) return false;
			// Ignore invalid messages
			if (message.author === null) return false;
			// Ignore client
			if (message.author.id === message.client.user.id) return false;

			try {
				const guildId = message.guildId;
				const messageAuthorId = message.author.id;
				const dateTime = message.createdAt.toISOString();
				const serverFlags = await getSettings(guildId);
				const messageUserOpt = await getOpt(guildId, messageAuthorId);

				// Finds all emojis in messages via regex
				const re = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/g;
				const emojis = message.content.matchAll(re);

				// Delete each message emoji from database
				if (serverFlags.countmessages && messageUserOpt) {
					for (const emoji of emojis) {
						const guildEmoji = await message.guild.emojis.fetch(emoji[3]);
						await deleteFromDb(guildId, guildEmoji.id, messageAuthorId, dateTime, 'messageActivity', 'messageDeleteBulk - message');
					}
				}

				// Delete each reaction emoji from database
				if (serverFlags.countreacts) {
					message.reactions.cache.each(async reaction => {
						// Check if reaction is a guild emoji
						if (message.guild.emojis.resolve(reaction.emoji)) {
							reaction.users.cache.each(async user => {
								const reactionUserOpt = await getOpt(guildId, user.id);

								// p -> q       Don't pass if message author is reaction user AND countselfreacts flag is false
								// Check server flag for if counting self-reacts for emoji usage is allowed
								if (!(messageAuthorId === user.id) || serverFlags.countselfreacts) {
									if (reactionUserOpt) await deleteFromDb(guildId, reaction.emoji.id, user.id, dateTime, 'reactsSentActivity', 'messageDeleteBulk - reaction:Sent');
									if (messageUserOpt) await deleteFromDb(guildId, reaction.emoji.id, messageAuthorId, dateTime, 'reactsReceivedActivity', 'messageDeleteBulk - reaction:Given');
								}
							});
						}
					});
				}
			}
			catch (e) {
				if (e.message === 'no such table: serverSettings') {
					await createDatabase(message.guildId);
				}
				else {
					console.error('messageDeleteBulk failed', e);
				}
			}
		});
	},
};