import discord
from discord.ext import commands

from db_model import get_getcount_member_alltime, get_getcount_member_monthly, get_getcount_member_weekly, \
    get_getcount_server_alltime, get_getcount_server_monthly, get_getcount_server_weekly


@commands.command(aliases=['gc'])
async def getcount(message, member: discord.Member = None):
    if member is not None:
        author_type = member.display_name + "'s"
        output_all_time = get_getcount_member_alltime(message, member.id)
        output_monthly = get_getcount_member_monthly(message, member.id)
        output_weekly = get_getcount_member_weekly(message, member.id)

        print(output_all_time[0], output_monthly[0], output_weekly[0])
    else:
        author_type = "Server's"
        output_all_time = get_getcount_server_alltime(message)
        output_monthly = get_getcount_server_monthly(message)
        output_weekly = get_getcount_server_weekly(message)

    embed = discord.Embed(
        colour=discord.Colour.orange()
    )
    embed.set_author(name=f'{author_type} Total Count Statistics')
    embed.add_field(name='All-Time', value=str(output_all_time[0]), inline=True)
    embed.add_field(name='Monthly', value=str(output_monthly[0]), inline=True)
    embed.add_field(name='Weekly', value=str(output_weekly[0]), inline=True)

    await message.send(embed=embed)  # Sends embed to chat.


@getcount.error
async def getcount_error(message, error):
    # print(error)
    embed = discord.Embed(
        colour=discord.Colour.orange()
    )
    embed.set_author(name='Improper Command Usage.')
    embed.add_field(name='Usage:', value='```ES getcount <optional:@user>'
                                         '\nES gc <optional:@user>```', inline=True)
    embed.add_field(name='Examples:',
                    value='```ES getcount\nES gc @EmojiStatistics```',
                    inline=False)
    await message.send(embed=embed)


def setup(bot):
    bot.add_command(getcount)
