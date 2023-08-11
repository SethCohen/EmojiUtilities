import { Events } from 'discord.js';

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}\nGuilds: ${client.guilds.cache.size}`);
    client.user.setActivity('/help');
  },
};
