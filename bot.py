import sqlite3
from collections import Counter
import discord
from discord.ext import commands
import re
import json

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
    client.load_extension('commands.help')
    client.load_extension('commands.leaderboard')
    client.load_extension('commands.getcount')
    client.load_extension('commands.displaystats')
    client.load_extension('commands.listemojis')

    # Parses through all guilds bots in.
    # for guild in client.guilds:
    #     print(guild.id)
    #     # Converts emoji column in databases from emoji string to emoji id.
    #     try:
    #         db_path = 'databases/' + str(guild.id) + '.sqlite'
    #         db_conn = sqlite3.connect(db_path)
    #         db_cursor = db_conn.cursor()
    #         db_cursor.execute(f"""
    #             SELECT
    #                 emoji
    #             FROM
    #                 emojiActivity
    #         """)
    #         rows = db_cursor.fetchall()
    #         for row in rows:
    #             if re.search(r'\d*>', row[0]):
    #                 id = re.search(r'\d*>', row[0])
    #                 id = id.group()
    #                 id = id[:-1]
    #                 db_cursor.execute(f"""
    #                     UPDATE emojiActivity
    #                     SET emoji = '{id}'
    #                     WHERE emoji = '{row[0]}'
    #                 """)
    #         db_conn.commit()
    #         db_cursor.close()
    #     except sqlite3.Error as error:
    #         print(error)
    # print("Done.")




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
                emoji = str(emoji.id)
                insert_to_db(message, emoji)

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
            for emoji in message.guild.emojis:
                if str_emoji == str(emoji):
                    emoji = str(emoji.id)
                    delete_from_db(message, emoji)

    # Removes reactions in deleted message from database
    for reaction in message.reactions:
        str_emoji = str(reaction.emoji.id)
        for x in range(reaction.count):
            for emoji in reaction.message.guild.emojis:
                if str_emoji == str(emoji.id):
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
            str_emoji = await commands.EmojiConverter().convert(after.author, str_emoji)
            str_emoji = str(str_emoji.id)
            delete_from_db(after, str_emoji)
    elif len(before_emojis) < len(after_emojis):  # Addition diff
        emojis = diff(after_emojis, before_emojis)
        for str_emoji in emojis:
            str_emoji = await commands.EmojiConverter().convert(after.author, str_emoji)
            str_emoji = str(str_emoji.id)
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
            emoji = str(emoji.id)
            insert_to_db(reaction.message, emoji)


@client.event
async def on_reaction_remove(reaction, user):
    """
    Reads every reaction on message, gets the reaction owner, and removes that record from the database.
    """

    str_emoji = str(reaction.emoji)

    for emoji in reaction.message.guild.emojis:
        if str_emoji == str(emoji):
            emoji = str(emoji.id)
            delete_from_db(reaction.message, emoji)


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
                    emoji = str(emoji.id)
                    delete_from_db(reaction.message, emoji)


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
