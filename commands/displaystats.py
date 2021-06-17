import asyncio
import math
import discord
from discord.ext import commands
from db_model import get_displaystats_member_all, get_displaystats_member_monthly, get_displaystats_member_weekly, \
    get_displaystats_server_all, get_displaystats_server_monthly, get_displaystats_server_weekly


def chunks(l, n):
    """
    Splits a list into evenly sized chunks where l is the list and n is the
    size of chunk. The last chunk gets any remainders.
    """

    n = max(1, n)
    return list(l[i:i + n] for i in range(0, len(l), n))


@commands.command(aliases=['ds'])
async def displaystats(message, date_range=None, member: discord.Member = None):
    """
    Formats specified query to send to chat.
    """
    # Selects query.
    if member is not None:
        author_type = member.display_name + "'s"
        if date_range == 'all' or date_range == 'a':
            date_type = 'All-time'
            rows = get_displaystats_member_all(message, member.id)
        elif date_range == 'monthly' or date_range == 'm':
            date_type = 'Monthly'
            rows = get_displaystats_member_monthly(message, member.id)
        elif date_range == 'weekly' or date_range == 'w':
            date_type = 'Weekly'
            rows = get_displaystats_member_weekly(message, member.id)
    else:
        author_type = 'Server'
        if date_range == 'all' or date_range == 'a':
            date_type = 'All-time'
            rows = get_displaystats_server_all(message)
        elif date_range == 'monthly' or date_range == 'm':
            date_type = 'Monthly'
            rows = get_displaystats_server_monthly(message)
        elif date_range == 'weekly' or date_range == 'w':
            date_type = 'Weekly'
            rows = get_displaystats_server_weekly(message)

    try:
        # Initializes the amount of embeds needed to display activity to chat.
        pages_count = math.ceil(len(rows) / 24)
        rows = chunks(rows, 24)
        list = []

        # Loops through needed pages
        for i in range(pages_count):
            # Initializes a new embed for each page
            embed = discord.Embed(
                colour=discord.Colour.orange()
            )
            embed.set_author(name=f'{author_type} Statistics ({date_type} usage, emoji : occurrence)')

            # Gets emojis from query and adds to embed
            for row in rows[i]:
                try:
                    emoji = await commands.EmojiConverter().convert(message, row[0])
                    if emoji.is_usable():
                        # print(str(emoji), ' is usable')
                        embed.add_field(name=emoji, value=row[1], inline=True)
                except discord.ext.commands.errors.EmojiNotFound as error:
                    print("Emoji not found: ", error)
            embed.set_footer(text="Page " + str(i + 1) + "/" + str(pages_count))
            list.append(embed)  # Adds embed to page

        embed_message = await message.send(embed=list[0])  # Sends embed to chat.
        await embed_message.add_reaction('◀')
        await embed_message.add_reaction('▶')

        # Gets and waits for user embed page changing.
        index = 0

        def check_react(reaction, user):
            return user == message.author and str(reaction.emoji) in ['◀', '▶']

        while True:
            try:
                reaction, user = await message.bot.wait_for(event='reaction_add', timeout=60.0, check=check_react)

                if str(reaction.emoji) == '◀' and index > 0:
                    # Goes to previous page
                    index -= 1
                    await embed_message.edit(embed=list[index])
                    await embed_message.remove_reaction('◀', user)
                elif str(reaction.emoji) == '▶' and index < pages_count:
                    # Goes to next page
                    index += 1
                    await embed_message.edit(embed=list[index])
                    await embed_message.remove_reaction('▶', user)
            except asyncio.TimeoutError:  # Break while loop when 60 seconds pass
                print('Reaction wait timeout.')
                await embed_message.clear_reactions()
                break
            except IndexError:
                print("No next/prev page to go to.")
        # -------------------------------------------
    except IndexError as error:
        # Catch for invalid output, outputs an embed to chat.
        print(error)
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


@displaystats.error
async def displaystats_error(message, error):
    print(error)
    embed = discord.Embed(
        colour=discord.Colour.orange()
    )
    embed.add_field(name='Usage:', value='```ES displaystats <date range> <optional:@user>'
                                         '\nES ds <date range> <optional:@user>```', inline=True)
    embed.add_field(name='Possible date range values:', value='```\nall\na\nmonthly\nm\nweekly\nw```', inline=False)
    embed.add_field(name='Examples:',
                    value='```ES displaystats all\nES displaystats weekly @EmojiStatistics\nES ds all```',
                    inline=False)
    await message.send(embed=embed)


def setup(bot):
    bot.add_command(displaystats)
