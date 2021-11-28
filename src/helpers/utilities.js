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
	sendErrorFeedback, setPerms,
};