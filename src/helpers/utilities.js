const { MessageEmbed } = require('discord.js');
const adminCommands = ['config', 'resetdb'];
const manageEmojisCommands = ['copysteal', 'removeunused', 'renameemoji', 'stickerfy', 'uploademoji'];
const mediaLinks = '[Vote for Emoji Utilities!](https://top.gg/bot/757326308547100712/vote) | [Support Me](https://sethdev.ca/support-me) | [Server](https://discord.gg/XaeERFAVfb) | [Github](https://github.com/SethCohen/EmojiUtilities)';

/** verifyEmojiString
 *		Pattern matches a string formatted emoji to verify if it is in fact an emoji.
 *
 * @param input 	The string emoji
 * @returns {*}		Returns either null or a regex object
 */
function verifyEmojiString(input) {
	const re = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/;
	return input.match(re);
}

/**	capitalizeFirstLetter
 * 		Converts the first character of a string into a capital
 *
 * @param string		String to convert
 * @returns {string}	Converted String
 */
function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

/**	sendErrorFeedback
 * 		Controls the response the user sees when an error is thrown.
 *
 * @param title				Where the error was thrown.
 * @param error				An error message to display to the user - if any.
 * @returns {MessageEmbed}	The resultant formatted error response.
 */
function sendErrorFeedback(title, error = null) {
	const unknownError = 'Unknown Error Found! Don\'t worry, the error was logged to the bot owner. A fix should be released soon. Thank you! 🙂';

	return new MessageEmbed()
		.setTitle(`${capitalizeFirstLetter(title)} Error!`)
		.setDescription(`**${error ? error : unknownError}**\n\nThink this error wasn't supposed to happen?\nTry joining our [support server](https://discord.gg/XaeERFAVfb) for help!`);
}

/**	setPerms
 * 		Sets if a guild role is/isn't allowed to use a global command.
 * 		Controlled from ready.js, guildCreate.js, roleUpdate.js events, and config.js command.
 *
 * @param guild			The guild to set perms for
 * @param rolesList		The list of roles to apply perms to
 * @param commandsList	The type of commands to set perms for (e.g. Admin commands or Manage Emoji commands)
 * @param flag			The flag to set (i.e. True or False)
 */
async function setPerms(guild, rolesList, commandsList, flag) {

	const permission = {
		guild: guild.id,
		permissions: [...rolesList.map(role => {
			return {
				id: role.id,
				type: 'ROLE',
				permission: flag,
			};
		})],
	};

	const applicationCommands = await guild.client.application.commands.fetch();
	const foundCommands = await applicationCommands.filter(command => commandsList.includes(command.name));
	foundCommands.forEach(async command => {
		await command.permissions.add(permission);
	});
}

module.exports = {
	sendErrorFeedback, setPerms, adminCommands, manageEmojisCommands, mediaLinks, verifyEmojiString,
};