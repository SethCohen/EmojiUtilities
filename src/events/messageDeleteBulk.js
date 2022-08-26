const { deleteFromDb, getOpt } = require('../helpers/dbModel');
const { getSetting } = require('../helpers/dbModel');

module.exports = {
	name: 'messageDeleteBulk',
	execute(messages) {
		messages.every(message => {

			// Ignore partials
			if (message.partial) {
				// console.log(`messageDeleteBulk message partial found. Can't fetch old messages.`)
				return false;
			}

			// Ignore invalid messages
			if (message.author === null) return false;

			// Ignore client
			if (message.author.id === message.client.user.id) return false;

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
							.then(fetchedEmoji => {
								// If users have not opted out of logging...
								if (getOpt(guildId, messageAuthorId)) deleteFromDb(guildId, fetchedEmoji.id, messageAuthorId, dateTime, 'messageActivity', 'messageDeleteBulk - message');
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
				if (getSetting(message.guildId, 'countreacts')) { // Check server flag for if counting reacts for emoji usage is allowed
					const guildId = message.guildId;
					const messageAuthorId = message.author.id;
					const dateTime = message.createdAt.toISOString();

					message.reactions.cache.each(reaction => {
						reaction.users.cache.each(user => {
							// p -> q       Don't pass if message author is reaction user AND countselfreacts flag is false
							if (!(messageAuthorId === user.id) || getSetting(guildId, 'countselfreacts')) { // Check server flag for if counting self-reacts for emoji usage is allowed
								// If users have not opted out of logging...
								if (getOpt(guildId, user.id)) deleteFromDb(guildId, reaction.emoji.id, user.id, dateTime, 'reactsSentActivity', 'messageDeleteBulk - reaction:Sent');
								if (getOpt(guildId, messageAuthorId)) deleteFromDb(guildId, reaction.emoji.id, messageAuthorId, dateTime, 'reactsReceivedActivity', 'messageDeleteBulk - reaction:Given');
							}
						});
					});
				}
			}
			catch (e) {
				console.error('messageDelete reaction delete failed', e);
			}
		});
	},
};