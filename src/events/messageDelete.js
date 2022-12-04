import { deleteFromDb, getOpt } from '../helpers/dbModel.js';
import { getSetting } from '../helpers/dbModel.js';

export default {
	name: 'messageDelete',
	async execute(message) {

		// Ignore partials
		if (message.partial) {
			// console.log(`messageDelete partial found. Can't fetch old messages.`)
			return false;
		}

		// Ignore invalid messages
		if (message.author === null) return false;

		// Ignore client
		if (message.author.id === message.client.user.id) return false;

		try {
			if (await getSetting(message.guildId, 'countmessages')) { // Check server flag for if counting messages for emoji usage is allowed
				const guildId = message.guildId;
				const messageAuthorId = message.author.id;
				const dateTime = message.createdAt.toISOString();

				// Finds all emojis in messages via regex
				const re = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/g;
				const emojis = message.content.matchAll(re);

				for (const emoji of emojis) {
					message.guild.emojis
						.fetch(emoji[3])
						.then(async fetchedEmoji => {
							if (await getOpt(guildId, messageAuthorId)) await deleteFromDb(guildId, fetchedEmoji.id, messageAuthorId, dateTime, 'messageActivity', 'messageDelete - message');
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
			if (await getSetting(message.guildId, 'countreacts')) { // Check server flag for if counting reacts for emoji usage is allowed
				const guildId = message.guildId;
				const messageAuthorId = message.author.id;
				const dateTime = message.createdAt.toISOString();

				message.reactions.cache.each(reaction => {
					if (message.guild.emojis.resolve(reaction.emoji)) { // Checks for if emoji reaction is a guild emoji
						reaction.users.cache.each(async user => {
							// p -> q       Don't pass if message author is reaction user AND countselfreacts flag is false
							if (!(messageAuthorId === user.id) || await getSetting(guildId, 'countselfreacts')) {	// Check server flag for if counting self-reacts for emoji usage is allowed
								// If users have not opted out of logging...
								if (await getOpt(guildId, user.id)) await deleteFromDb(guildId, reaction.emoji.id, user.id, dateTime, 'reactsSentActivity', 'messageDelete - reaction:Sent');
								if (await getOpt(guildId, messageAuthorId)) await deleteFromDb(guildId, reaction.emoji.id, messageAuthorId, dateTime, 'reactsReceivedActivity', 'messageDelete - reaction:Given');
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