import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { setOpt, clearUserFromDb } from '../helpers/mongodbModel.js';
import { confirmationButtons, sendErrorFeedback } from '../helpers/utilities.js';

export default {
  data: new SlashCommandBuilder()
    .setName('optself')
    .setDescription('Opts the command user in or out of emoji usage logging.')
    .addStringOption((option) =>
      option
        .setName('flag')
        .setDescription('Whether to opt-in or opt-out')
        .addChoices({ name: 'Opt-in', value: 'true' }, { name: 'Opt-out', value: 'false' })
        .setRequired(true)
    ),
  async execute(interactionCommand) {
    await interactionCommand.deferReply({ ephemeral: true });

    const flag = interactionCommand.options.getString('flag');

    const embed = new EmbedBuilder()
      .setTitle(
        `Are you sure you want to opt-${flag === 'true' ? 'in' : 'out'} of your server's database?`
      )
      .setDescription(
        `${
          flag === 'true'
            ? 'Opting in will allow the bot to record your emoji usage again.'
            : "Opting out will both disallow that AND **clear all previous records of your emoji usage from your server's database immediately.**\nThis is a permanent decision. There is no undoing this action."
        }`
      );

    await interactionCommand.editReply({
      embeds: [embed],
      components: [confirmationButtons(true)],
    });

    // Create button listeners
    const message = await interactionCommand.fetchReply();
    const filter = async (i) => {
      await i.deferUpdate();
      if (i.user.id !== interactionCommand.user.id) {
        await i.followUp({
          content: "You can't interact with this button. You are not the command author.",
          ephemeral: true,
        });
      }
      return i.user.id === interactionCommand.user.id;
    };
    message
      .awaitMessageComponent({ filter, time: 30000 })
      .then(async (interactionButton) => {
        if (interactionButton.customId === 'confirm') {
          await setOpt(
            interactionCommand.client.db,
            interactionCommand.guildId,
            interactionCommand.member.id,
            flag === 'true'
          );

          await interactionButton.followUp({
            content: `You have opted-${flag === 'true' ? 'in' : 'out'}. Take care!`,
            ephemeral: true,
          });

          // if opted-out delete user from databases
          if (flag !== 'true') {
            await clearUserFromDb(
              interactionCommand.client.db,
              interactionCommand.guildId,
              interactionCommand.member.id
            );
          }
        } else if (interactionButton.customId === 'cancel') {
          await interactionButton.followUp({
            content: `Canceled opt-${flag === 'true' ? 'in' : 'out'}.`,
            ephemeral: true,
          });
        }

        await interactionCommand.editReply({
          components: [confirmationButtons(false)],
        });
      })
      .catch(async (error) => {
        switch (error.message) {
          case 'Unknown Message':
            // Ignore unknown interactions (Often caused from deleted interactions).
            break;
          case 'Collector received no interactions before ending with reason: time':
            await interactionCommand.editReply({
              content: 'User took too long. Interaction timed out.',
              embeds: [embed],
              components: [],
            });
            break;
          default:
            console.error(
              `Command:\n${interactionCommand.commandName}\nError Message:\n${
                error.message
              }\nRaw Input:\n${interactionCommand.options.getString('flag')}`
            );
            return await interactionCommand.editReply({
              embeds: [sendErrorFeedback(interactionCommand.commandName)],
              components: [],
            });
        }
      });
  },
};
