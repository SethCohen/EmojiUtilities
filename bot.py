import discord
from discord.ext import commands
from discord import Message, Emoji
import sqlite3
import re
import json



client = commands.Bot(command_prefix = 'ES ')

@client.event
async def on_ready():
    await client.change_presence(activity=discord.Game('ES display'))
    print('Bot is online.')
    print()

@client.command()
async def display(message):
    await message.send('Available commands:\nES createdb\nES listEmojis')

@client.command()
async def listEmojis(message):
    emojis_list = '';
    for emoji in message.guild.emojis:
        emojis_list += str(emoji) + ' '

    emojis_list = re.sub(r'<:\w*:>', '', emojis_list)
    print(emojis_list)
    #for splicedList in chunks:
    await message.send(emojis_list)

@client.command()
async def createdb(message):
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

@client.event
async def on_message(message):
    #checks if bot is sender
    if message.author == client.user:
        return

    print(f'User input:\n{message.content}\n')

    if any(str(emoji) in message.content for emoji in message.guild.emojis):
        print("local emojis in message found")
        emojis = re.findall(r'<:\w*:\d*>', message.content) #finds ALL emoji IDs, not just local emojis
        for strEmoji in emojis:
            print(strEmoji)

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
    else:
        print('no local emoji found')

    await client.process_commands(message)

f = open('config.json',)
data = json.load(f)

client.run(data['token'])
