import { deleteFromDb, getOpt } from '../helpers/dbModel.js';
import { getSetting } from '../helpers/dbModel.js';

export default {
	name: 'messageReactionRemove',
	async execute(messageReaction, user) {
		// console.log(`messageReactionRemove: ${messageReaction.message}, ${messageReaction.emoji}, ${user}.`);

		// Fetch any partials
		if (messageReaction.partial) {
			await messageReaction.fetch().catch(e => {
				// console.error('messageReactionRemove messageReaction.fetch() failed.', e);
				return false;
			});
		}
		if (messageReaction.message.partial) {
			await messageReaction.message.fetch().catch(e => {
				// console.error('messageReactionRemove messageReaction.message.fetch() failed.', e);
				return false;
			});
		}

		// Ignore invalid messages
		if (messageReaction.message.author === null) return false;

		// Ignore client
		if (messageReaction.me || messageReaction.message.author.id === messageReaction.client.user.id) return false;

		try {
			if (await getSetting(messageReaction.message.guildId, 'countreacts')) { // Check server flag for if counting reacts for emoji usage is allowed
				const guildId = messageReaction.message.guildId;
				const reactionAuthorId = user.id;
				const messageAuthorId = messageReaction.message.author.id;
				const dateTime = messageReaction.message.createdAt.toISOString();

				// p -> q       Don't pass if message author is reaction user AND countselfreacts flag is false
				if (!(messageAuthorId === reactionAuthorId) || await getSetting(guildId, 'countselfreacts')) { // Check server flag for if counting self-reacts for emoji usage is allowed
					if (messageReaction.emoji.id) { // if not unicode emoji
						messageReaction.message.guild.emojis
							.fetch(messageReaction.emoji.id)
							.then(async emoji => {
								// console.log(emoji)

								// If users have not opted out of logging...
								if (await getOpt(guildId, messageAuthorId)) await deleteFromDb(guildId, emoji.id, messageAuthorId, dateTime, 'reactsReceivedActivity', 'messageReactionRemove');
								if (await getOpt(guildId, reactionAuthorId)) await deleteFromDb(guildId, emoji.id, reactionAuthorId, dateTime, 'reactsSentActivity', 'messageReactionRemove');
							})
							.catch(ignoreError => {
								// Ignores failed fetches (As failed fetches means the emoji is not a guild emoji)
							});
					}
				}
			}
		}
		catch (e) {
			console.error('messageReactionRemove failed deleting.', e);
		}
	},
};