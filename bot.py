import discord
from discord.ext import commands
from discord import Message, Emoji
import sqlite3
import re
import json

client = commands.Bot(command_prefix = 'ES ')
client.remove_command('help')

def diff(list1, list2):
    return (list(list(set(list1)-set(list2)) + list(set(list2)-set(list1))))

def sayLongLineSplitted(text,wrap_at=2000):
    """Splits text at spaces and joins it to strings that are as long as
    possible without overshooting wrap_at.

    Returns a list of strings shorter then wrap_at."""
    splitted = text.split(" ")
    def gimme():
        """Yields sentences of correct lenght."""
        len_parts = 0
        parts = []
        for p in splitted:
            len_p = len(p)
            if len_parts + len_p < wrap_at:
                parts.append(p)
                len_parts += len_p + 1
            else:
                yield ' '.join(parts).strip()
                parts = [p]
                len_parts = len_p
        if parts:
            yield ' '.join(parts).strip()

    return list(gimme())

@client.event
async def on_ready():
    await client.change_presence(activity=discord.Game('ES help'))
    print('Bot is online.')
    print()

@client.command()
async def display(message):
    

@client.command()
async def help(message):
    embed = discord.Embed(
        colour = discord.Colour.orange()
    )
    embed.set_author(name='Command List:')
    embed.add_field(name='ES createdb', value='Creates database to start tracking.', inline=False)
    embed.add_field(name='ES display', value='Prints emoji usage statistics.', inline=False)
    embed.add_field(name='ES listemojis', value='Prints all usable server emotes to chat.', inline=False)

    await message.send(embed=embed)

@client.command()
async def listemojis(message):
    emojis_list = '';
    for emoji in message.guild.emojis:
        if emoji.is_usable():
            emojis_list += str(emoji) + ' '

    for part in sayLongLineSplitted(emojis_list):
        await message.send(part)

@client.command()
async def createdb(message):
    try:
        db_path = str(message.guild.id) + '.sqlite'
        db_conn = sqlite3.connect(db_path)
        db_cursor = db_conn.cursor()
        db_cursor.execute("""
            CREATE TABLE IF NOT EXISTS db (
            emoji TEXT UNIQUE,
            occurrence INT
            )
            """)

        insert = """INSERT OR IGNORE INTO db(emoji, occurrence) VALUES(?, 0);"""

        for emoji in message.guild.emojis:
            db_cursor.execute(insert, [str(emoji)])

        db_conn.commit()
        db_cursor.close()

        await message.send('Database created.')
    except sqlite3.Error as error:
        print("Failed to create sqlite table", error)

@client.event
async def on_message(message):
    #checks if bot is sender
    if message.author == client.user:
        return

    if any(str(emoji) in message.content for emoji in message.guild.emojis):
        emojis = re.findall(r'<:\w*:\d*>', message.content) #finds ALL emoji IDs, not just local emojis
        for strEmoji in emojis:
            db_path = str(message.guild.id) + '.sqlite'
            db_conn = sqlite3.connect(db_path)
            db_cursor = db_conn.cursor()
            db_cursor.execute("""
                UPDATE db
                SET occurrence = occurrence + 1
                WHERE emoji = ?
                """, (strEmoji,))

            db_conn.commit()
            db_cursor.close()

    await client.process_commands(message)

f = open('config.json',)
data = json.load(f)

@client.event
async def on_guild_emojis_update(guild, before, after):
    emoji = diff(before, after)
    strEmoji = str(emoji[0])
    if (len(before) > len(after)):
        print("Deleting from db...")
        try:
            db_path = str(guild.id) + '.sqlite'
            db_conn = sqlite3.connect(db_path)
            db_cursor = db_conn.cursor()
            db_cursor.execute("""
                DELETE from db WHERE emoji = ?
                """, (strEmoji,))

            db_conn.commit()
            db_cursor.close()
        except sqlite3.Error as error:
            print("Failed to delete record from sqlite table", error)
    elif (len(before) < len(after)):
        print("Adding to db...")
        try:
            db_path = str(guild.id) + '.sqlite'
            db_conn = sqlite3.connect(db_path)
            db_cursor = db_conn.cursor()

            db_cursor.execute("""
                INSERT OR IGNORE INTO
                db(emoji, occurrence)
                VALUES(?, 0);""", (strEmoji,))

            db_conn.commit()
            db_cursor.close()
        except sqlite3.Error as error:
            print("Failed to add record to sqlite table", error)

client.run(data['token'])
