# EmojiStatistics
Discord.py Bot for tracking server-specific emoji usage

> * [List of Commands](https://github.com/SethCohen/EmojiStatistics/blob/master/README.md#list-of-commands)
> * [What The Bot Does](https://github.com/SethCohen/EmojiStatistics/blob/master/README.md#what-the-bot-specifically-does)
> * [How To Use](https://github.com/SethCohen/EmojiStatistics/blob/master/README.md#how-to-use)
> * [Screenshots](https://github.com/SethCohen/EmojiStatistics/blob/master/README.md#screenshots)

## List Of Commands:

1. `ES help` - Prints a list of all commands to chat.
2. `ES displaystats` - Prints the database to chat.
3. `ES listemojis` - Prints all server emojis to chat.
4. `ES getcount` - Prints total emoji usage statistics to chat.
5. `ES leaderboard` - Prints most used emoji usage by persons to chat.

## What The Bot Specifically Does:

Upon joining a server the bot creates an empty database with columns (emoji, person, datetime).
The bot reads chat for whenever any emojis are entered into chat eitehr via reactions or messages. If an emoji is found, a new row is entered into the database with the emoji name, the person who posted the emoji, and the time the emoji was added to chat.
Whenever any emojis are removed from chat (either via reactions cleared or message deleted/edited), the corresponding records in the database are also deleted.

Tl;dr, the bot adds/removes emoji activity records in live-time to each servers unique database.

## How To Use:

Simply add the bot to your discord [using this invite link](https://discord.com/api/oauth2/authorize?client_id=757326308547100712&permissions=93248&scope=bot) and then...
Thats it! The bot should be given permission to view/read every channel for the highest accuracy. Now just wait for users to use server emojis and check the database whenever you wish using `ES displaystats`.

## Screenshots:

![Screenshot1](https://i.imgur.com/axMIdUo.png)

