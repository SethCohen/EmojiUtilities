import { Events } from 'discord.js';
import { processMessageDelete } from './messageDelete.js';
import { insertGuild } from '../helpers/mongodbModel.js';

async function processMessageDeleteBulk(messages) {
  for (const message of messages.values()) {
    await processMessageDelete(message);
  }
}

export default {
  name: Events.MessageBulkDelete,
  async execute(messages, channel) {
    try {
      await processMessageDeleteBulk(messages);
    } catch (error) {
      if (error.message == `Cannot read properties of null (reading 'usersOpt')`) {
        await insertGuild(channel.client.db, channel.guild);
      } else {
        console.error(Events.MessageBulkDelete, error);
      }
    }
  },
};
