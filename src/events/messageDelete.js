const { deleteFromDb } = require('../helpers/dbModel');
const { getSetting } = require('../helpers/dbModel');

module.exports = {
	name: 'messageDelete',
	async execute(message) {

		// Ignore partials
		if (message.partial) {
			// console.log(`messageDelete partial found. Can't fetch old messages.`)
			return false;
		}

		if (message.author === null) {
			return false;
		}

		// Ignore client
		if (message.author.id === message.client.user.id) {
			return false;
		}

		try {
			if (getSetting(message.guildId, 'countmessages')) { // Count messages
				const guildId = message.guildId;
				const messageAuthorId = message.author.id;
				const dateTime = message.createdAt.toISOString();

				// Finds all emojis in messages via regex
				const re = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/g;
				const emojis = message.content.matchAll(re);

				for (const emoji of emojis) {
					message.guild.emojis
						.fetch(emoji[3])
						.then(fetchedEmoji => {
							deleteFromDb(guildId, fetchedEmoji.id, messageAuthorId, dateTime, 'messageActivity', 'messageDelete - message');
						})
						.catch(ignoreError => {
							// Ignores failed fetches (As failed fetches means the emoji is not a guild emoji)
						});
				}
			}
		}
		catch (e) {
			console.error('messageDelete message delete failed', e);
		}

		try {
			if (getSetting(message.guildId, 'countreacts')) { // Count reacts
				const guildId = message.guildId;
				const messageAuthorId = message.author.id;
				const dateTime = message.createdAt.toISOString();

				message.reactions.cache.each(reaction => {
					if (message.guild.emojis.resolve(reaction.emoji)) { // Checks for if emoji reaction is a guild emoji
						reaction.users.cache.each(user => {
							// p -> q       Dont pass if message author is reaction user AND countselfreacts flag is false
							if (!(messageAuthorId === user.id) || getSetting(guildId, 'countselfreacts')) {
								deleteFromDb(guildId, reaction.emoji.id, user.id, dateTime, 'reactsSentActivity', 'messageDelete - reaction:Sent');
								deleteFromDb(guildId, reaction.emoji.id, messageAuthorId, dateTime, 'reactsReceivedActivity', 'messageDelete - reaction:Given');
							}
						});
					}
				});
			}
		}
		catch (e) {
			console.error('messageDelete reaction delete failed', e);
		}
	},
};