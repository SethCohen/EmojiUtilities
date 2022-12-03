import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
const mediaLinks = '[Support Me](https://sethdev.ca/support-me) | [Server](https://discord.gg/XaeERFAVfb) | [Github](https://github.com/SethCohen/EmojiUtilities) | [Vote](https://top.gg/bot/757326308547100712/vote)';

/** verifyEmojiString
 *		Pattern matches a string formatted emoji to verify if it is in fact an emoji.
 *
 * @param input 	The string emoji
 * @returns {*}		Returns either null or a regex object of [0] whole match, [1] isAnimated, [2] name, [3] id
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
 * @returns {EmbedBuilder}	The resultant formatted error response.
 */
function sendErrorFeedback(title, error = null) {
	const unknownError = 'Unknown Error Found! Don\'t worry, the error was logged to the bot owner. A fix should be released soon. Thank you! 🙂';

	return new EmbedBuilder()
		.setTitle(`${capitalizeFirstLetter(title)} Error!`)
		.setDescription(`**${error ? error : unknownError}**\n\nThink this error wasn't supposed to happen?\nTry joining our [support server](https://discord.gg/XaeERFAVfb) for help!`);
}

/**	navigationButtons
 *		Controls pagination buttons state and whether they are enabled or disabled.
 * @param isEnabled
 * @returns {ActionRowBuilder}
 */
const navigationButtons = isEnabled => {
	return new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('prev')
				.setLabel('👈 Prev')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(!isEnabled),
			new ButtonBuilder()
				.setCustomId('next')
				.setLabel('👉 Next')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(!isEnabled),
		);
};

/**	confirmationButtons
 *		Controls confirmation buttons state and whether they are enabled or disabled.
 * @param isEnabled
 * @returns {ActionRowBuilder}
 */
const confirmationButtons = isEnabled => {
	return new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('confirm')
				.setLabel('✔ Confirm')
				.setStyle(ButtonStyle.Success)
				.setDisabled(!isEnabled),
			new ButtonBuilder()
				.setCustomId('cancel')
				.setLabel('❌ Cancel')
				.setStyle(ButtonStyle.Danger)
				.setDisabled(!isEnabled),
		);
};

export {
	sendErrorFeedback, mediaLinks, verifyEmojiString, navigationButtons, confirmationButtons,
};