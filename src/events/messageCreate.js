import { insertToDb, getOpt, createDatabase } from '../helpers/dbModel.js';
import { getSettings } from '../helpers/dbModel.js';

export default {
	name: 'messageCreate',
	async execute(message) {
		// Ignore client
		if (message.author.id === message.client.user.id) return false;

		try {
			const guildId = message.guildId;
			const messageAuthorId = message.author.id;
			const dateTime = message.createdAt.toISOString();

			// Check server flag for if counting messages for emoji usage is allowed
			const serverFlags = await getSettings(guildId);
			if (!serverFlags.countmessages) return false;

			// Check if user is opted out of logging
			const userOpt = await getOpt(guildId, messageAuthorId);
			if (!userOpt) return false;

			// Finds all emojis in messages via regex
			const re = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/g;
			const emojis = message.content.matchAll(re);

			// Insert each emoji into database
			for (const emoji of emojis) {
				const guildEmoji = await message.guild.emojis.fetch(emoji[3]);
				await insertToDb(guildId, guildEmoji.id, messageAuthorId, dateTime, 'messageActivity', 'messageCreate');
			}
		}
		catch (e) {
			if (e.message === 'no such table: serverSettings') {
				await createDatabase(message.guildId);
			}
			else if (e.message === 'Unknown Emoji') {
				return false;
			}
			else {
				console.error('messageCreate failed', e);
			}
		}
	},
};