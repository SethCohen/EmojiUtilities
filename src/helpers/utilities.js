const adminCommands = ['config', 'resetdb'];
const manageEmojisCommands = ['copysteal', 'removeunused', 'renameemoji', 'stickerfy', 'uploademoji'];
const mediaLinks = '[Vote for Emoji Utilities!](https://top.gg/bot/757326308547100712/vote) | [Support Me](https://sethdev.ca/support-me) | [Server](https://discord.gg/XaeERFAVfb) | [Github](https://github.com/SethCohen/EmojiUtilities)';

function sendErrorFeedback() {
	return '\nIf you think this was an error, try joining our support server: https://discord.gg/XaeERFAVfb';
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