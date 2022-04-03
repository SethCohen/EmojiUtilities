const { insertToDb } = require('../helpers/dbModel');
const { getSetting } = require('../helpers/dbModel');

module.exports = {
	name: 'messageCreate',
	execute(message) {

		// Ignore client
		if (message.author.id === message.client.user.id) {
			return false;
		}

		try {
			if (getSetting(message.guildId, 'countmessages')) { // Check server flag for if counting messages for emoji usage is allowed
				const guildId = message.guildId;
				const messageAuthorId = message.author.id;
				const dateTime = message.createdAt.toISOString();

				// Finds all emojis in messages via regex
				const re = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/g;
				const emojis = message.content.matchAll(re);

				for (const emoji of emojis) {
					message.guild.emojis
						.fetch(emoji[3])
						.then(fetchedEmoji => insertToDb(guildId, fetchedEmoji.id, messageAuthorId, dateTime, 'messageActivity', 'messageCreate'))
						.catch(ignoreError => {
							// Ignores failed fetches (As failed fetches means the emoji is not a guild emoji)
						});
				}
			}
		}
		catch (e) {
			console.error('messageCreate insert failed', e);
		}
	},
};