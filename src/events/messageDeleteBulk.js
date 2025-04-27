import { Events } from 'discord.js';
import { processMessageDelete } from './messageDelete.js';
import { insertGuild } from '../helpers/mongodbModel.js';

const processMessageDeleteBulk = async (messages) => {
  for (const message of messages.values()) {
    await processMessageDelete(message);
  }
};

export default {
  name: Events.MessageBulkDelete,
  async execute(messages, channel) {
    try {
      await processMessageDeleteBulk(messages);
    } catch (error) {
      if (error.message === `Cannot read properties of null (reading 'usersOpt')`) {
        console.warn(`Guild data missing for ${channel.guild?.name} (${channel.guildId}). Reinserting...`);
        await insertGuild(channel.client.db, channel.guild);
      } else {
        console.error(`Error in ${Events.MessageBulkDelete}:`, error);
      }
    }
  },
};
