import discord
from discord.ext import commands


@commands.has_permissions(administrator=True)
@commands.command()
async def docountmessages(message, subcommand=''):

    subcommand = subcommand.lower()
    if subcommand == 'true':
        message.bot.do_count_messages = True
        await message.send("docountmessages set to True.")
    elif subcommand == 'false':
        message.bot.do_count_messages = False
        await message.send("docountmessages set to False.")


def setup(bot):
    bot.add_command(docountmessages)
