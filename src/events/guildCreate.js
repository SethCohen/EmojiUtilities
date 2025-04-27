import { mediaLinks } from '../helpers/constants.js';
import { insertGuild } from '../helpers/mongodbModel.js';
import { EmbedBuilder, ChannelType, PermissionsBitField, Events } from 'discord.js';

const sendEmbedToChannel = async (channel, embed) => {
  try {
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error(`Failed to send embed to ${channel.name}: ${error.message}`);
  }
};

const findFirstAccessibleTextChannel = (guild) => {
  return guild.channels.cache.find((channel) =>
    channel.type === ChannelType.GuildText &&
    channel.permissionsFor(guild.members.me)?.has([
      PermissionsBitField.Flags.ViewChannel,
      PermissionsBitField.Flags.SendMessages,
    ])
  );
};

const postWelcomeEmbed = async (guild, embed) => {
  const publicChannel = guild.publicUpdatesChannel;
  if (publicChannel) {
    try {
      await sendEmbedToChannel(publicChannel, embed);
      return;
    } catch (error) {
      console.error(
        `Can't post to public updates channel in ${guild.name}: ${error.message}\nFalling back to another channel.`
      );
    }
  }

  const fallbackChannel = findFirstAccessibleTextChannel(guild);
  if (fallbackChannel) {
    await sendEmbedToChannel(fallbackChannel, embed);
  } else {
    console.error(`No accessible text channels found in ${guild.name}. Welcome message not sent.`);
  }
};

export default {
  name: Events.GuildCreate,
  async execute(guild) {
    console.log(`Guild Created (${guild.name}). Current Server Count: ${guild.client.guilds.cache.size}`);

    await insertGuild(guild.client.db, guild);

    const embed = new EmbedBuilder()
      .setTitle('Hello! Nice to meet you!')
      .setDescription(
        `${mediaLinks}\n\nThanks For Adding Me To Your Server!\nDon't worry, everything has been setup for you.\nJust make sure I have **View** access to all the channels otherwise I won't be able to track emoji usage.\nUse \`/help\` for a list of commands. If you have any issues, feel free to join our support server.\n\nThanks again and have a nice day! 🙂`
      );

    await postWelcomeEmbed(guild, embed);
  },
};
