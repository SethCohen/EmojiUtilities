import discord
from discord.ext import commands
from db_model import get_leaderboard


@commands.command(aliases=['lb'])
async def leaderboard(context, emoji: discord.Emoji):
    rows = get_leaderboard(context, emoji)

    try:
        embed = discord.Embed(
            colour=discord.Colour.orange()
        )
        embed.set_author(name=emoji.name + ' Leaderboard')
        embed.set_thumbnail(url=emoji.url)
        position = 1
        for row in rows:
            # print(row[0])
            try:
                embed.add_field(name=str(position) + ". " + str(context.bot.get_user(int(row[0]))), value=str(row[1]),
                                inline=False)
                position += 1
            except ValueError:
                # print('Value Error')
                embed.add_field(name=str(position) + ". " + str(row[0]),
                                value=str(row[1]),
                                inline=False)
                position += 1

        await context.send(embed=embed)
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
        await context.send(embed=embed)


@leaderboard.error
async def leaderboard_error(context, error):
    # print(error)
    embed = discord.Embed(
        colour=discord.Colour.orange()
    )
    embed.set_author(name='Improper Command Usage.')
    embed.add_field(name='Usage:', value='```ES leaderboard <emoji>'
                                         '\nES lb <emoji>```', inline=True)
    embed.add_field(name='Examples:',
                    value='```ES leaderboard :thonk:\nES lb :thonk:```',
                    inline=False)
    await context.send(embed=embed)


def setup(bot):
    bot.add_command(leaderboard)
