const { deleteFromDb, getOpt } = require('../helpers/dbModel');
const { getSetting } = require('../helpers/dbModel');

module.exports = {
	name: 'messageReactionRemoveAll',
	async execute(message, reactions) {
		// console.dir(`messageReactionRemoveAll: ${message.content}, ${message.author}, ${reactions}.`);

		// Ignore partials
		if (message.partial) {
			// console.log(`messageReactionRemoveAll partial found. Can't fetch reactions from old messages.`)
			return false;
		}

		// Ignore invalid messages
		if (message.author === null) {
			return false;
		}

		// Ignore client
		if (message.author.id === message.client.user.id) {
			return false;
		}

		try {
			reactions.each(reaction => {
				// console.log(reaction.count, reaction.emoji.id, reaction)
				reaction.users.cache.each(user => {
					if (getSetting(message.guildId, 'countreacts')) { // Check server flag for if counting reacts for emoji usage is allowed
						const guildId = message.guildId;
						const reactionAuthorId = user.id;
						const messageAuthorId = message.author.id;
						const dateTime = message.createdAt.toISOString();

						// p -> q       Don't pass if message author is reaction user AND countselfreacts flag is false
						if (!(messageAuthorId === reactionAuthorId) || getSetting(guildId, 'countselfreacts')) { // Check server flag for if counting self-reacts for emoji usage is allowed
							if (reaction.emoji.id) { // if not unicode/default emoji...
								message.guild.emojis
									.fetch(reaction.emoji.id)
									.then(emoji => {
										// console.log(emoji)

										// If users have not opted out of logging...
										if (getOpt(guildId, reactionAuthorId)) deleteFromDb(guildId, emoji.id, reactionAuthorId, dateTime, 'reactsSentActivity', 'messageReactionRemoveAll');
										if (getOpt(guildId, messageAuthorId)) deleteFromDb(guildId, emoji.id, messageAuthorId, dateTime, 'reactsReceivedActivity', 'messageReactionRemoveAll');
									})
									.catch(ignoreError => {
										// Ignores failed fetches (As failed fetches means the emoji is not a guild emoji)
									});
							}
						}
					}
				});
			});
		}
		catch (e) {
			console.error('messageReactionRemoveAll failed deleting.', e);
		}

	},
};