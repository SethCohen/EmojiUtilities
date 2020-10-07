# EmojiStatistics
Discord.py Bot for tracking server-specific emoji usage

> * [What The Bot Does](https://github.com/SethCohen/EmojiStatistics/blob/master/README.md#what-the-bot-specifically-does)
> * [Screenshots](https://github.com/SethCohen/EmojiStatistics/blob/master/README.md#Screenshots
> * [List of Commands](https://github.com/SethCohen/EmojiStatistics/blob/master/README.md#list-of-commands)

## What The Bot Specifically Does:

Each server gets its own specific database. The database is just two columns: Emoji, Occurrence. The database is initialized with all the server's emojis with the emoji name/id under the Emoji column and the number 0 under the Occurrence column.
The database is also live cleaned/updated as well; whenever a new emoji is added to the server, a new row of the emoji also gets added to the database. And when an emoji is deleted from the server, it's row gets deleted from the database.
The bot reads live every new message/reaction from every channel checking for if said message/reaction is/has any server-specific emojis. If any server-specific emojis are found, it selects the emoji from the database and increases the Occurrence value.

## Screenshots:

![Screenshot1](https://i.imgur.com/fOpoffn.png)
![Screenshot2](https://i.imgur.com/popPDaB.png)
![Screenshot3](https://i.imgur.com/Bvf9QT6.png)

## List Of Commands:

1. `ES help` - Prints a list of all commands to chat.
2. `ES createdb` - Creates a server-specific database (The first command you should run when adding the bot to your server to get started)
3. `ES listemojis` - Prints all server emojis to chat.
4. `ES displaystats` - Prints the database to chat.
