const { insertToDb } = require('../db_model');
const { getSetting } = require('../db_model');

module.exports = {
	name: 'messageReactionAdd',
	async execute(messageReaction, user) {
		// console.log(`messageReactionAdd: ${messageReaction.message}, ${messageReaction.emoji}, ${user}.`);

		// Fetch any partials
		if (messageReaction.partial) {
			await messageReaction.fetch().catch(e => {
				console.error('messageReactionAdd messageReaction.fetch() failed.', e);
				return false;
			});
		}
		if (messageReaction.message.partial) {
			await messageReaction.message.fetch().catch(e => {
				console.error('messageReactionAdd messageReaction.message.fetch() failed.', e);
				return false;
			});
		}

		// Ignore client
		if (messageReaction.me || messageReaction.message.author.id === messageReaction.client.user.id) {
			return false;
		}

		try {
			if (getSetting(messageReaction.message.guildId, 'countreacts')) { // Count reacts
				const guildId = messageReaction.message.guildId;
				const reactionAuthorId = user.id;
				const messageAuthorId = messageReaction.message.author.id;
				const dateTime = messageReaction.message.createdAt.toISOString();

				// p -> q       Dont pass if message author is reaction user AND countselfreacts flag is false
				if (!(messageAuthorId === reactionAuthorId) || getSetting(guildId, 'countselfreacts')) {
					if (messageReaction.emoji.id) { // Checks if emoji is a custom emoji
						messageReaction.message.guild.emojis
							.fetch(messageReaction.emoji.id)
							.then(emoji => {
								// console.log(emoji)
								insertToDb(guildId, emoji.id, reactionAuthorId, dateTime, 'reactsSentActivity', 'messageReactionAdd');
								insertToDb(guildId, emoji.id, messageAuthorId, dateTime, 'reactsReceivedActivity', 'messageReactionAdd');
							})
						// eslint-disable-next-line no-unused-vars
							.catch(ignoreError => {
								// Ignores failed fetches (As failed fetches means the emoji is not a guild emoji)
							});
					}
				}
			}
		}
		catch (e) {
			console.error('messageReactionAdd failed inserting.', e);
		}

	},
};