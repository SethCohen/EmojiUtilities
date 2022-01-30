const { MessageEmbed } = require('discord.js');
const adminCommands = ['config', 'resetdb'];
const manageEmojisCommands = ['copysteal', 'removeunused', 'renameemoji', 'stickerfy', 'uploademoji'];
const mediaLinks = '[Vote for Emoji Utilities!](https://top.gg/bot/757326308547100712/vote) | [Support Me](https://sethdev.ca/support-me) | [Server](https://discord.gg/XaeERFAVfb) | [Github](https://github.com/SethCohen/EmojiUtilities)';

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function sendErrorFeedback(title, error) {
	const unknownError = 'Unknown Error Found! Don\'t worry, the error was logged to the bot owner. A fix should be released soon. Thank you! 🙂';

	return new MessageEmbed()
		.setTitle(`${capitalizeFirstLetter(title)} Error!`)
		.setDescription(`**${error ? error : unknownError}**\n\nThink this error wasn't supposed to happen?\nTry joining our [support server](https://discord.gg/XaeERFAVfb) for help!`);
}

function setPerms(role, commandsList, flag) {
	// guild.commands.fetch()                       // Guild commands
	role.client.application?.commands.fetch() // Global commands
		.then(async commands => {
			for (const name of commandsList) {
				const foundCommand = await commands.find(command => command.name === name);
				const permission = [{ id: role.id, type: 'ROLE', permission: flag }];
				await foundCommand.permissions.add({ guild: role.guild.id, permissions: permission });
			}
		}).catch(e => console.error(e.toString())); // Unable to fetch guild commands.
}

module.exports = {
	sendErrorFeedback, setPerms, adminCommands, manageEmojisCommands, mediaLinks,
};