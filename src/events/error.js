import { Events } from 'discord.js';

export default {
  name: Events.Error,
  async execute(error) {
    console.error(error);
  },
};
