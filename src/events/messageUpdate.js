import { insertToDb, getOpt, createDatabase } from '../helpers/dbModel.js';
import { deleteFromDb } from '../helpers/dbModel.js';
import { getSettings } from '../helpers/dbModel.js';

export default {
	name: 'messageUpdate',
	async execute(oldMessage, newMessage) {
		// Ignore partials
		if (oldMessage.partial || newMessage.partial) return false;
		// Ignore invalid messages
		if (newMessage.author === null) return false;
		// Ignore client
		if (newMessage.author.id === newMessage.client.user.id) return false;

		try {
			const guildId = newMessage.guildId;
			const messageAuthorId = newMessage.author.id;
			const dateTime = newMessage.createdAt.toISOString();

			// Check server flag for if counting messages for emoji usage is allowed
			const serverFlags = await getSettings(guildId);
			if (!serverFlags.countmessages) return false;

			// Check if user is opted out of logging
			const userOpt = await getOpt(guildId, messageAuthorId);
			if (!userOpt) return false;

			// Finds all emojis in messages via regex
			const re = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/g;
			const emojisBefore = [...oldMessage.content.matchAll(re)];
			const emojisAfter = [...newMessage.content.matchAll(re)];

			// Delete old records
			for (const emoji of emojisBefore) {
				const guildEmoji = await oldMessage.guild.emojis.fetch(emoji[3]);
				await deleteFromDb(guildId, guildEmoji.id, messageAuthorId, dateTime, 'messageActivity', 'messageUpdate');
			}

			// Insert new records
			for (const emoji of emojisAfter) {
				const guildEmoji = await newMessage.guild.emojis.fetch(emoji[3]);
				await insertToDb(guildId, guildEmoji.id, messageAuthorId, dateTime, 'messageActivity', 'messageUpdate');
			}
		}
		catch (e) {
			if (e.message === 'no such table: serverSettings') {
				await createDatabase(newMessage.guildId);
			}
			else if (e.message === 'Unknown Emoji') {
				return false;
			}
			else {
				console.error('messageUpdate failed', e);
			}
		}
	},
};