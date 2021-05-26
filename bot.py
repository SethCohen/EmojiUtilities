from collections import Counter
import discord
from discord.ext import commands
import re
import json
import asyncio

from db_model import create_database, insert_to_db, delete_from_db

intents = discord.Intents.default()
intents.members = True

client = commands.Bot(command_prefix='ES ', intents=intents)
client.remove_command('help')


# Non-Event/Command Functions:

def diff(list1, list2):
    """
    Gets the difference between two lists.
    e.g. list1 = [1, 2, 3, 4, 5, 6]   list2 = [1, 2, 3, 4]
    returns [5, 6]
    """

    return list((Counter(list1) - Counter(list2)).elements())


# ---------------------------------------

@client.event
async def on_ready():
    """
    Sets bots activity status and prints to console bots live.
    """

    await client.change_presence(activity=discord.Game('ES help'))
    print('Bot is online.')
    client.load_extension('commands.leaderboard')
    client.load_extension('commands.getcount')
    client.load_extension('commands.displaystats')
    client.load_extension('commands.listemojis')


@client.command()
async def help(message, subcommand=''):
    """
    Displays list of commands and other useful info to chat.
    """

    embed = discord.Embed(
        colour=discord.Colour.orange(),
        description="[Invite To Server]"
                    "(https://discord.com/api/oauth2/authorize?client_id=757326308547100712&permissions=84992&scope=bot)"
                    "\n[Github]"
                    "(https://github.com/SethCohen/EmojiStatistics)"
    )

    if subcommand == 'displaystats':
        embed.set_author(name='ES display')
        embed.add_field(name='Usage:', value='```ES displaystats <date range> <optional:@user>'
                                             '\nES ds <date range> <optional:@user>```', inline=True)
        embed.add_field(name='Possible date range values:', value='```\n(a)ll\n(m)onthly\n(w)eekly```', inline=False)
        embed.add_field(name='Examples:',
                        value='```ES displaystats all\nES displaystats w @EmojiStatistics\nES ds all @EmojiStatistics\nES ds a```',
                        inline=False)
    elif subcommand == 'getcount':
        embed.set_author(name='ES getcount')
        embed.add_field(name='Usage:', value='```ES getcount <optional:@user>'
                                             '\nES gc <optional:@user>```', inline=True)
        embed.add_field(name='Examples:',
                        value='```ES getcount\nES gc @EmojiStatistics```',
                        inline=False)
    elif subcommand == 'leaderboard':
        embed.set_author(name='ES leaderboard')
        embed.add_field(name='Usage:', value='```ES leaderboard <emoji>'
                                             '\nES lb <emoji>```', inline=True)
    elif subcommand == 'listemojis':
        embed.set_author(name='ES listemojis')
        embed.add_field(name='Usage:', value='```ES listemojis'
                                             '\nES le```', inline=True)
    else:
        embed.set_author(name='Help & Commands:')
        embed.add_field(name='ES displaystats', value='Prints specific emoji usage statistics to chat.', inline=False)
        embed.add_field(name='ES getcount', value='Prints total emoji usage statistics to chat.', inline=False)
        embed.add_field(name='ES leaderboard', value='Prints most used emoji usage by persons to chat.', inline=False)
        embed.add_field(name='ES listemojis', value='Prints all usable server emotes to chat.', inline=False)
        embed.set_footer(text='Type ES help <subcommand> to view a command in-depth.\ne.g. `ES help displaystats')

    await message.send(embed=embed)


# @client.command(aliases=['del'])
# @commands.has_permissions(administrator=True)
# async def delete(message):
#     await message.channel.send("Are you sure you want to delete your server's database? (Yes/No)")
#
#     def check(m):
#         return m.content in ['Yes', 'No', 'yes', 'no'] and m.channel == message.channel
#
#     try:
#         msg = await client.wait_for('message', timeout=30.0, check=check)
#
#         if msg.content.lower() == 'yes':
#             await message.send('k.')
#         if msg.content.lower() == 'no':
#             await message.send('un-k.')
#     except asyncio.TimeoutError:
#         print('Wait timeout.')


@client.event
async def on_message(message):
    """
    Reads every message sent in server. Used to check if any message has an emoji.
    """

    # Checks if bot is sender, if true then pass
    if message.author == client.user:
        return

    # Reads emojis in message
    emojis = re.findall(r'<:\w*:\d*>|<a:\w*:\d*>', message.content)  # Finds all emojis in message
    # print('Detected emojis in message', message.id, ':', emojis)

    for str_emoji in emojis:
        for emoji in message.guild.emojis:
            if str_emoji == str(emoji):
                insert_to_db(message, str_emoji)

    """if any(str(emoji) in message.content for emoji in message.guild.emojis):
        emojis = re.findall(r'<:\w*:\d*>|<a:\w*:\d*>', message.content)     # Finds emojis in message and server

        for str_emoji in emojis:
            if str_emoji in str(message.guild.emojis):
                insert_query(message, str_emoji)"""

    await client.process_commands(message)


@client.event
async def on_message_delete(message):
    """
    Reads every message deleted in server. Used to check if any deleted message has an emoji.
    """

    # Checks if bot is sender, if true then pass
    if message.author == client.user:
        return

    # Reads emojis in message
    if any(str(emoji) in message.content for emoji in message.guild.emojis):
        emojis = re.findall(r'<:\w*:\d*>|<a:\w*:\d*>', message.content)  # Finds emojis in message and server
        print('Detected emojis in message', message.id, ':', emojis)
        for str_emoji in emojis:
            delete_from_db(message, str_emoji)

    # Removes reactions in deleted message from database
    for reaction in message.reactions:
        str_emoji = str(reaction.emoji)
        for x in range(reaction.count):
            for emoji in reaction.message.guild.emojis:
                if str_emoji == str(emoji):
                    delete_from_db(reaction.message, str_emoji)


@client.event
async def on_message_edit(before, after):
    """
    Reads every message edited in server.
    Used to check if any edited message has either added or removed emojis from message.
    """

    if any(str(emoji) in before.content for emoji in before.guild.emojis):
        before_emojis = re.findall(r'<:\w*:\d*>|<a:\w*:\d*>', before.content)
    else:
        before_emojis = []

    if any(str(emoji) in after.content for emoji in after.guild.emojis):
        after_emojis = re.findall(r'<:\w*:\d*>|<a:\w*:\d*>', after.content)
    else:
        after_emojis = []

    # print('Before:', before_emojis)
    # print('After:', after_emojis)
    if len(before_emojis) > len(after_emojis):  # Subtraction diff
        emojis = diff(before_emojis, after_emojis)
        for str_emoji in emojis:
            delete_from_db(after, str_emoji)
    elif len(before_emojis) < len(after_emojis):  # Addition diff
        emojis = diff(after_emojis, before_emojis)
        for str_emoji in emojis:
            insert_to_db(after, str_emoji)
    else:
        emojis = []

    # print('Diff:', emojis)


@client.event
async def on_reaction_add(reaction, user):
    """
    Reads every reaction on message, gets who added the reaction, and adds that record into database.
    """

    str_emoji = str(reaction.emoji)

    for emoji in reaction.message.guild.emojis:
        if str_emoji == str(emoji):
            insert_to_db(reaction.message, str_emoji)


@client.event
async def on_reaction_remove(reaction, user):
    """
    Reads every reaction on message, gets the reaction owner, and removes that record from the database.
    """

    str_emoji = str(reaction.emoji)

    for emoji in reaction.message.guild.emojis:
        if str_emoji == str(emoji):
            delete_from_db(reaction.message, str_emoji)


@client.event
async def on_reaction_clear(message, reactions):
    """
    Reads a messages reactions and if they've all been cleared.
    Loops through each reaction in the message and gets the count of each reaction
    then removes each individual row.
    """
    for reaction in reactions:
        str_emoji = str(reaction.emoji)
        for x in range(reaction.count):
            for emoji in reaction.message.guild.emojis:
                if str_emoji == str(emoji):
                    delete_from_db(reaction.message, str_emoji)


@client.event
async def on_guild_join(guild):
    """
    Initializes db for server.
    """

    # Sends basic greeting message on guild join to first available channel
    for channel in guild.text_channels:
        if channel.permissions_for(guild.me).send_messages:
            await channel.send(
                "Hey, thanks for adding me to your server!"
                "\nThere's no need to do anything else, the database has been setup for you."
                "\nType `ES help` for a list of commands. Thanks again and have a nice day!")
        break

    create_database(guild.id)


@client.event
async def on_command_error(context, error):
    if isinstance(error, commands.MissingPermissions):
        await context.send('You do not have permissions for this command.')


# Bot authorization
f = open('config.json', )
data = json.load(f)
client.run(data['token'])
