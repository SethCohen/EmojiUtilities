import discord
from discord.ext import commands


def split_message(text, wrap_at=2000):
    """
    Splits text at spaces and joins it to strings that are as long as
    possible without overshooting wrap_at.
    Returns a list of strings shorter then wrap_at.
    """

    split_text = text.split(" ")

    def gimme():
        # Yields sentences of correct length.
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


@commands.command(aliases=['le'])
async def listemojis(message):
    """
    Lists all usable emojis in server to chat.
    """

    emojis_list = ''
    for emoji in message.guild.emojis:
        if emoji.is_usable():
            emojis_list += str(emoji) + ' '

    for part in split_message(emojis_list):
        await message.send(part)


def setup(bot):
    bot.add_command(listemojis)
