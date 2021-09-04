import discord
from discord.ext import commands


@commands.has_permissions(administrator=True)
@commands.command()
async def doselfreact(message, subcommand=''):

    subcommand = subcommand.lower()
    if subcommand == 'true':
        message.bot.do_self_react = True
        await message.send("doselfreact set to True.")
    elif subcommand == 'false':
        message.bot.do_self_react = False
        await message.send("doselfreact set to False.")


def setup(bot):
    bot.add_command(doselfreact)
