const { insertToDb, getOpt } = require('../helpers/dbModel');
const { deleteFromDb } = require('../helpers/dbModel');
const { getSetting } = require('../helpers/dbModel');

module.exports = {
	name: 'messageUpdate',
	async execute(oldMessage, newMessage) {
		// console.log(`messageUpdate: ${oldMessage.content}, ${oldMessage.author} -> ${newMessage.content}, ${newMessage.author}.`);

		// Ignore partials
		if (oldMessage.partial || newMessage.partial) {
			// console.log(`messageUpdate partial found. Can't fetch oldMessage.`)
			return false;
		}

		// Ignore invalid messages
		if (newMessage.author === null) return false;

		// Ignore client
		if (newMessage.author.id === newMessage.client.user.id) return false;

		if (getSetting(newMessage.guildId, 'countmessages')) { // Check server flag for if counting messages for emoji usage is allowed
			const guildId = newMessage.guildId;
			const messageAuthorId = newMessage.author.id;
			const dateTime = newMessage.createdAt.toISOString();

			// Finds all emojis in messages via regex
			const re = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/g;
			const emojisBefore = [...oldMessage.content.matchAll(re)];
			const emojisAfter = [...newMessage.content.matchAll(re)];

			// Delete old records
			for (const emoji of emojisBefore) {
				oldMessage.guild.emojis
					.fetch(emoji[3])
					.then(fetchedEmoji => {
						if (getOpt(guildId, messageAuthorId)) deleteFromDb(guildId, fetchedEmoji.id, messageAuthorId, dateTime, 'messageActivity', 'messageUpdate');
					})
					.catch(ignoreError => {
						// Ignores failed fetches (As failed fetches means the emoji is not a guild emoji)
					});
			}

			// Insert new records
			for (const emoji of emojisAfter) {
				newMessage.guild.emojis
					.fetch(emoji[3])
					.then(fetchedEmoji => {
						if (getOpt(guildId, messageAuthorId)) insertToDb(guildId, fetchedEmoji.id, messageAuthorId, dateTime, 'messageActivity', 'messageUpdate');
					})
					.catch(ignoreError => {
						// Ignores failed fetches (As failed fetches means the emoji is not a guild emoji)
					});
			}
		}
	},
};