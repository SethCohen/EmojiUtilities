import { getEmojiTotalCount } from '../helpers/mongodbModel.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { sendErrorFeedback, verifyEmojiString } from '../helpers/utilities.js';
import { mediaLinks } from '../helpers/constants.js';

export default {
  data: new SlashCommandBuilder()
    .setName('aboutemoji')
    .setDescription('Displays generic information about an emoji.')
    .addStringOption((option) =>
      option.setName('emoji').setDescription('The emoji to get info for.').setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();

    try {
      const stringEmoji = interaction.options.getString('emoji');
      const verifiedEmoji = verifyEmojiString(stringEmoji);
      const emoji = await interaction.guild.emojis.fetch(verifiedEmoji[3]);

      let author;
      try {
        author = await emoji.fetchAuthor();
      } catch (e) {
        author = "`N/A` - Bot is missing `Manage Emojis` permission and can't access emoji author.";
      }

      const count = await getEmojiTotalCount(interaction.client.db, interaction.guild.id, emoji.id);

      const embedSuccess = new EmbedBuilder()
        .setTitle(`${emoji.name}`)
        .setDescription(mediaLinks)
        .setThumbnail(`${emoji.imageURL()}`)
        .addFields(
          { name: 'Author:', value: author.toString() },
          { name: 'Date Added:', value: emoji.createdAt.toString() },
          { name: 'Total Times Used:', value: count.toString() }
        );

      return interaction.editReply({ embeds: [embedSuccess] });
    } catch (error) {
      switch (error.message) {
        case 'no such table: messageActivity':
          // await createDatabase(interaction.guildId);
          await interaction.editReply({
            embeds: [
              sendErrorFeedback(
                interaction.commandName,
                'Guild database was not found!\nA new database was created just now.\nPlease try the command again.'
              ),
            ],
          });
          break;
        case "Cannot read properties of null (reading '3')":
          await interaction.editReply({
            embeds: [sendErrorFeedback(interaction.commandName, 'No emoji found in `emoji`.')],
          });
          break;
        case 'Unknown Emoji':
          await interaction.editReply({
            embeds: [
              sendErrorFeedback(
                interaction.commandName,
                "Emoji in `emoji` is from another server.\nI can't get info on emojis from other servers, sorry!\n\nIf you were trying to get an emoji from another server though, try `/copysteal`. "
              ),
            ],
          });
          break;
        default:
          console.error(
            `Command:\n${interaction.commandName}\nError Message:\n${
              error.message
            }\nRaw Input:\n${interaction.options.getString('emoji')}`
          );
          return await interaction.editReply({
            embeds: [sendErrorFeedback(interaction.commandName)],
          });
      }
    }
  },
};
