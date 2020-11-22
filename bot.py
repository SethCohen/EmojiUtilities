import discord
from discord.ext import commands
import sqlite3
import re
import json
import math
import asyncio

intents = discord.Intents.default()
intents.members = True

client = commands.Bot(command_prefix='ES ', intents=intents)
client.remove_command('help')


def displaystats_query(context, query):
    try:
        db_path = 'databases/' + str(context.guild.id) + '.sqlite'
        db_conn = sqlite3.connect(db_path)
        db_cursor = db_conn.cursor()
        db_cursor.execute(query)
        rows = db_cursor.fetchall()
        # print(rows)
    except sqlite3.Error as error:
        print("Failed to get from table:", error)
    finally:
        db_conn.commit()
        db_cursor.close()
        return rows


def chunks(l, n):
    """Splits a list into evenly sized chunks where l is the list and n is the
    size of chunk. The last chunk gets any remainders."""

    n = max(1, n)
    return list(l[i:i + n] for i in range(0, len(l), n))


def diff(list1, list2):
    """Gets the difference between two lists.
    e.g. list1 = [1, 2, 3, 4, 5, 6]   list2 = [1, 2, 3, 4]
    returns [5, 6]"""

    return list(list(set(list1) - set(list2)) + list(set(list2) - set(list1)))


def split_message(text, wrap_at=2000):
    """Splits text at spaces and joins it to strings that are as long as
    possible without overshooting wrap_at.
    Returns a list of strings shorter then wrap_at."""

    split_text = text.split(" ")

    def gimme():
        """Yields sentences of correct length."""
        len_parts = 0
        parts = []
        for p in split_text:
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
    """Sets bots activity status and prints to console bots live"""

    await client.change_presence(activity=discord.Game('ES help'))
    print('Bot is online.')


@client.command()
async def displaystats(message, date_range=None, member: discord.Member = None):
    if member is not None:
        author_type = member.display_name + "'s"
        if date_range == 'all':
            date_type = 'All-time'
            query = f"""
                 SELECT 
                     emoji,
                     COUNT(emoji) 
                 FROM 
                     emojiActivity
                 WHERE 
                     person = '{member}'
                 GROUP BY 
                     emoji
                 ORDER BY COUNT(emoji) DESC
                 """
            rows = displaystats_query(message, query)
        elif date_range == 'monthly':
            date_type = 'Monthly'
            query = f"""
                         SELECT 
                             emoji,
                             COUNT(emoji) 
                         FROM 
                             emojiActivity
                         WHERE
                             person = '{member}' AND
                             datetime > date('now', '-1 month')
                         GROUP BY 
                             emoji        
                         ORDER BY COUNT(emoji) DESC
                         """
            rows = displaystats_query(message, query)
        elif date_range == 'weekly':
            date_type = 'Weekly'
            query = f"""
                         SELECT 
                             emoji,
                             COUNT(emoji) 
                         FROM 
                             emojiActivity
                         WHERE
                             person = '{member}' AND
                             datetime > date('now', '-7 day')
                         GROUP BY 
                             emoji        
                         ORDER BY COUNT(emoji) DESC
                         """
            rows = displaystats_query(message, query)
    else:
        author_type = 'Server'
        if date_range == 'all':
            date_type = 'All-time'
            query = """
                 SELECT 
                     emoji,
                     COUNT(emoji) 
                 FROM 
                     emojiActivity
                 GROUP BY 
                     emoji        
                 ORDER BY COUNT(emoji) DESC
                 """
            rows = displaystats_query(message, query)
        elif date_range == 'monthly':
            date_type = 'Monthly'
            query = """
                         SELECT 
                             emoji,
                             COUNT(emoji) 
                         FROM 
                             emojiActivity
                         WHERE
                             datetime > date('now', '-1 month')
                         GROUP BY 
                             emoji        
                         ORDER BY COUNT(emoji) DESC
                         """
            rows = displaystats_query(message, query)
        elif date_range == 'weekly':
            date_type = 'Weekly'
            query = """
                         SELECT 
                             emoji,
                             COUNT(emoji) 
                         FROM 
                             emojiActivity
                         WHERE
                             datetime > date('now', '-7 day')
                         GROUP BY 
                             emoji        
                         ORDER BY COUNT(emoji) DESC
                         """
            rows = displaystats_query(message, query)

    # Tries to display an output if possible.
    try:
        pages_count = math.ceil(len(rows) / 24)
        rows = chunks(rows, 24)
        list = []

        for i in range(pages_count):
            embed = discord.Embed(
                colour=discord.Colour.orange()
            )
            embed.set_author(name=f'{author_type} Statistics ({date_type} usage, emoji : occurrence)')

            for row in rows[i]:
                try:
                    emoji = await commands.EmojiConverter().convert(message, row[0])
                except discord.ext.commands.errors.EmojiNotFound as error:
                    print("Emoji not found: ", error)
                if emoji.is_usable():
                    embed.add_field(name=row[0], value=row[1], inline=True)
            embed.set_footer(text="Page " + str(i + 1) + "/" + str(pages_count))
            list.append(embed)

        embed_message = await message.send(embed=list[0])
        await embed_message.add_reaction('◀')
        await embed_message.add_reaction('▶')

        index = 0

        def check_react(reaction, user):
            return user == message.author and str(reaction.emoji) in ['◀', '▶']

        while True:
            try:
                reaction, user = await client.wait_for('reaction_add', timeout=60.0, check=check_react)

                if str(reaction.emoji) == '◀' and index > 0:
                    index -= 1
                    await embed_message.edit(embed=list[index])
                elif str(reaction.emoji) == '▶' and index < pages_count:
                    index += 1
                    await embed_message.edit(embed=list[index])
            except asyncio.TimeoutError:
                print('Reaction wait timeout.')
                break
            except IndexError:
                print("No next/prev page to go to.")
    except IndexError:
        embed = discord.Embed(
            colour=discord.Colour.orange()
        )
        embed.set_author(name='Nothing To Display!')
        embed.add_field(name='User input has no valid output.',
                        value='Possible reasons:'
                              '\n- Empty database'
                              '\n- No emoji-usage records at specified date range'
                              '\n- No emoji-usage records by specified user'
                        )
        await message.send(embed=embed)
    except UnboundLocalError as error:
        print(error)
        embed = discord.Embed(
            colour=discord.Colour.orange()
        )
        embed.set_author(name='Improper Command Usage.')
        embed.add_field(name='Usage:', value='```ES displaystats <date range> <optional:@user>```', inline=True)
        embed.add_field(name='Possible date ranges:', value='```\nall\nmonthly\nweekly```', inline=False)
        embed.add_field(name='Examples:',
                        value='```ES displaystats all\nES displaystats weekly @EmojiStatistics```', inline=False)
        await message.send(embed=embed)


@client.command()
async def help(message):
    embed = discord.Embed(
        colour=discord.Colour.orange(),
        description="[Invite To Server]"
                    "(https://discord.com/api/oauth2/authorize?client_id=757326308547100712&permissions=84992&scope=bot)"
                    "\n[Github]"
                    "(https://github.com/SethCohen/EmojiStatistics)"
    )
    embed.set_author(name='Help & Commands:')
    embed.add_field(name='ES displaystats', value='Prints emoji usage statistics to chat.', inline=False)
    embed.add_field(name='ES listemojis', value='Prints all usable server emotes to chat.', inline=False)

    await message.send(embed=embed)


@client.command()
async def listemojis(message):
    emojis_list = ''
    for emoji in message.guild.emojis:
        if emoji.is_usable():
            emojis_list += str(emoji) + ' '

    for part in split_message(emojis_list):
        await message.send(part)


@client.event
async def on_message(message):
    # Checks if bot is sender
    if message.author == client.user:
        return

    # Reads emojis in message
    if any(str(emoji) in message.content for emoji in message.guild.emojis):
        emojis = re.findall(r'<:\w*:\d*>|<a:\w*:\d*>', message.content)  # finds ALL emoji IDs, not just local emojis
        print('Detected emojis in message', message.id, ':', emojis)
        for strEmoji in emojis:
            # Inserts new record
            try:
                db_path = 'databases/' + str(message.guild.id) + '.sqlite'
                db_conn = sqlite3.connect(db_path)
                db_cursor = db_conn.cursor()
                db_cursor.execute("""
                    INSERT INTO emojiActivity(emoji, person, datetime)
                    VALUES(?, ?, ?)
                    """, (strEmoji, str(message.author), message.created_at.strftime('%Y-%m-%d')))
            except sqlite3.Error as error:
                print("Failed to insert", error, "into db.")
            finally:
                db_conn.commit()
                db_cursor.close()

    await client.process_commands(message)


@client.event
async def on_reaction_add(reaction, user):
    str_emoji = str(reaction.emoji)

    for emoji in reaction.message.guild.emojis:
        if str_emoji == str(emoji):
            try:
                db_path = 'databases/' + str(reaction.message.guild.id) + '.sqlite'
                db_conn = sqlite3.connect(db_path)
                db_cursor = db_conn.cursor()
                db_cursor.execute("""
                        INSERT INTO emojiActivity(emoji, person, datetime)
                        VALUES(?, ?, ?)
                        """, (str_emoji, str(reaction.message.author), reaction.message.created_at.strftime('%Y-%m-%d')))
                print(f"Record has been inserted: ({str_emoji}, "
                      f"{str(reaction.message.author)}, "
                      f"{reaction.message.created_at.strftime('%Y-%m-%d')})")
            except sqlite3.Error as error:
                print('Failed to insert reaction to db:', error)
            finally:
                db_conn.commit()
                db_cursor.close()


@client.event
async def on_reaction_remove(reaction, user):
    str_emoji = str(reaction.emoji)

    for emoji in reaction.message.guild.emojis:
        if str_emoji == str(emoji):
            try:
                db_path = 'databases/' + str(reaction.message.guild.id) + '.sqlite'
                db_conn = sqlite3.connect(db_path)
                db_cursor = db_conn.cursor()
                db_cursor.execute("""
                        DELETE FROM emojiActivity
                        WHERE rowid = 
                        (
                            SELECT rowid
                            FROM emojiActivity
                            WHERE 
                                emoji = ? AND 
                                person = ? AND 
                                datetime = ?
                            LIMIT 1
                        )
                        """, (str_emoji, str(reaction.message.author), reaction.message.created_at.strftime('%Y-%m-%d')))
                print(f"Record has been removed: ({str_emoji}, "
                      f"{str(reaction.message.author)}, "
                      f"{reaction.message.created_at.strftime('%Y-%m-%d')})")
            except sqlite3.Error as error:
                print('Failed to delete record from db:', error)
            finally:
                db_conn.commit()
                db_cursor.close()


@client.event
async def on_guild_join(guild):
    for channel in guild.text_channels:
        if channel.permissions_for(guild.me).send_messages:
            await channel.send(
                "Hey, thanks for adding me to your server!"
                "\nThere's no need to do anything else, the database has been setup for you."
                "\nType `ES help` for a list of commands. Thanks again and have a nice day!")
        break

    try:
        db_path = 'databases/' + str(guild.id) + '.sqlite'
        db_conn = sqlite3.connect(db_path)
        db_cursor = db_conn.cursor()
        db_cursor.execute("""
            CREATE TABLE IF NOT EXISTS emojiActivity (
            emoji TEXT,
            person TEXT,
            datetime TEXT 
            )
            """)
    except sqlite3.Error as error:
        print("Failed to create sqlite table", error)
    finally:
        db_conn.commit()
        db_cursor.close()
        print('Database created for', guild.id)


f = open('config.json', )
data = json.load(f)
client.run(data['token'])
