import discord
from discord.ext import commands


@commands.command(aliases=['h'])
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
                    "\n[Support Server]"
                    "(https://discord.gg/XaeERFAVfb)"
    )

    if subcommand == 'displaystats':
        embed.set_author(name='ES displaystats')
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
    elif subcommand == 'doselfreact':
        embed.set_author(name='ES doselfreact')
        embed.add_field(name='Usage:', value='```ES doselfreact true'
                                             '\nES doselfreact false```', inline=True)
    elif subcommand == 'docountmessages':
        embed.set_author(name='ES docountmessages')
        embed.add_field(name='Usage:', value='```ES docountmessages true'
                                             '\nES docountmessages false```', inline=True)
    else:
        embed.set_author(name='Help & Commands:')
        embed.add_field(name='ES displaystats', value='Prints specific emoji usage statistics to chat.', inline=False)
        embed.add_field(name='ES getcount', value='Prints total emoji usage statistics to chat.', inline=False)
        embed.add_field(name='ES leaderboard', value='Prints most used emoji usage by persons to chat.', inline=False)
        embed.add_field(name='ES listemojis', value='Prints all usable server emotes to chat.', inline=False)
        embed.add_field(name='ES doselfreact', value='Enable/disable adding user self reacting emojis to db.', inline=False)
        embed.add_field(name='ES docountmessages', value='Enable/disable adding message emojis to db.', inline=False)
        embed.set_footer(text='Type ES help <subcommand> to view a command in-depth.\ne.g. `ES help displaystats')

    await message.send(embed=embed)


def setup(bot):
    bot.add_command(help)
