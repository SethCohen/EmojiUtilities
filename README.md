# EmojiUtilities

## A Discord Bot for all your custom emoji-related tools, utilities, and info in one convenient bot.

<p align="center"> <a href="https://discord.com/api/oauth2/authorize?client_id=757326308547100712&permissions=1074129984&scope=bot%20applications.commands">Invite To Server</a> | <a href="https://top.gg/bot/757326308547100712/vote">Vote For Emoji Utilities!</a> | <a href="https://sethdev.ca/support-me">Support Me</a> | <a href="https://discord.gg/XaeERFAVfb">Server</a> | <a href="https://github.com/SethCohen/EmojiUtilities">Github</a></p>

### Table Of Contents

- [Intro](#some-things-the-bot-can-do)
- [How To Use](#how-to-use)
- [Supported Commands](#supported-commands)
- [Documentation](#documentation)

---

## Some things the bot can do:

<img align="right" src="https://i.imgur.com/ngY7lUP.gif">

- Track who received a emoji reaction to their message.
- Track who sent an emoji in either a reaction or in a message.
- Displays generic emoji info such as who created the emoji, when the emoji was created, etc
- Displays all kind of usage statistics such as
    - usage count between any date ranges for all emojis
    - leaderboards of who's sent/received an emoji the most
    - the total emoji usage count in a server between any date range
- Copy emotes from other servers into yours.
- Create stickers out of gifs.

**And more!**

## How To Use:

Simply add the bot to the server and that's it. The database gets automatically initialized upon joining, as your users
use custom emotes, those get added to your server's database and you can query them using the variety of bot commands.

## Supported Commands:

![](https://i.imgur.com/yt6P22D.png)

## Documentation:

### Utility Commands

- /displaystats `daterange: <daterange>` `optional:user: <user>`
    - Takes in a date range from `[ All-Time, Yearly, Monthly, Weekly, Daily, Hourly ]` and returns a table
      of `emoji : count`. When user is not specified, result defaults to for server.
  <details>
    <summary>Example</summary>

  ![](https://i.imgur.com/R3gbrMt.gif)
  </details>
- /getcount `optional:user: <user>`
    - Returns the total count sum of all emojis for every date range. Defaults to for Server if User is not specified.
  <details>
    <summary>Example</summary>

  ![](https://i.imgur.com/WLqqdOH.gif)
  </details>
- /leaderboard `type: Sent|Received` `emoji: <emoji>` `optional:daterange: <daterange>`
    - Returns the top 10 users who have sent or received a specified emoji within an optionally specified date range the
      most.
  <details>
    <summary>Example</summary>

  ![](https://i.imgur.com/k2riODl.gif)
  </details>
- /aboutemoji `emoji: <emoji>`
    - Displays basic info about an emoji such as the emoji creator, when it was added, etc.
  <details>
    <summary>Example</summary>

  ![](https://i.imgur.com/dqHq2ys.gif)
  </details>
- /botinfo
    - Displays basic info about the bot such as how many guilds the bot it is, when it was created, etc.
  <details>
    <summary>Example</summary>

  ![](https://i.imgur.com/gWtlEfl.gif)
  </details>
- /listemojis
    - Prints all emojis to chat and the total amount of emojis the server has.
  <details>
    <summary>Example</summary>

  ![](https://i.imgur.com/49ZlRQ5.gif)
  </details>
- /backupemojis
    - Sends a `.zip` file containing all the image files of every emoji in a server.
  <details>
    <summary>Example</summary>

  ![](https://i.imgur.com/4RDxIHt.gif)
  </details>

### Fun Commands:

- /clapify `text: <text>`
    - Returns the given text, but with 👏 in-between.
  <details>
    <summary>Example</summary>

  ![](https://i.imgur.com/yD3bVdN.gif)
  </details>
- /dancify `text: <text>`
    - Returns the given text, but each alphanumerical is replaced with a dancing red letter emoji.
  <details>
    <summary>Example</summary>

  ![](https://i.imgur.com/K1LXTaL.gif)
  </details>
- /enlargeemoji `emoji: <emoji>`
    - Returns an image of emoji.
  <details>
    <summary>Example</summary>

  ![](https://i.imgur.com/w5tpYzW.gif)
  </details>

### Emoji.gg Commands:

- /packsearch `name: <name>`
    - Searches [emoji.gg](https://emoji.gg/) for a pack based on a given name.
  <details>
    <summary>Example</summary>

  ![](https://i.imgur.com/HZTH7x2.gif)
  </details>
- /random
    - Returns a random emoji from [emoji.gg](https://emoji.gg/).
  <details>
    <summary>Example</summary>

  ![](https://i.imgur.com/GZGUiDS.gif)
  </details>
- /search `name: <name>` `optional:category: <category>` `optional:includensfw: True|False`
    - Searches [emoji.gg](https://emoji.gg/) for an emoji based on a given name.
  <details>
    <summary>Example</summary>

  ![](https://i.imgur.com/xith6Ss.gif)
  </details>

### Admin Commands:

Requires a role with `Administator` permissions.

- /config countmessages `flag: True|False`
    - Allows bot to count messages into server's db.
- /config countreacts `flag: True|False`
    - Allows bot to count reacts into server's db.
- /config countselfreacts `flag: True|False`
    - Allows bot to count self reacts (Where user reacted to their own message) into server's db.
- /config allownsfw `flag: True|False`
    - Allows for NSFW results with `/search` and `/random`
- /config togglecommand `command: <name>` `flag: True | False`
    - Disables/Enables a specified command completely, regardless of role or user perms.
- /resetdb
    - Resets all emoji records from a server's db. Doesn't reset a server's config settings though.

### Manage Emoji Commands:

Requires a role with `Manage Emojis And Stickers` permissions.

- /copysteal `emoji: <emoji>` `optional:name: <name>`
    - Takes in a discord emoji from another server and uploads it to your server. Randomly generates a name if one is
      not given. If user does not have Nitro, `/uploademoji` may be the better command instead.
  <details>
    <summary>Example</summary>

  ![](https://i.imgur.com/VsfavtA.gif)
  </details>
- /removeunused `number: <number>`
    - Removes however many - as specified by user - of the least used emojis from the server.
  <details>
    <summary>Example</summary>

  ![](https://i.imgur.com/xp6crXx.gif)
  </details>
- /renameemoji `emoji: <emoji>` `name: <name>`
    - Renames a given emoji with a new name given in command.
  <details>
    <summary>Example</summary>

  ![](https://i.imgur.com/msJTwMz.gif)
  </details>
- /stickerfy `url: <url>` `name: <name>` `tag: <unicode emoji>`
    - Takes in a url to `.gif` image, applies some image editing if needed (Such as compression, resizing, etc),
      converts the image to an `.apng` and attempts to upload it to server as a sticker.
  <details>
    <summary>Example</summary>

  ![](https://i.imgur.com/8Ah2bmU.gif)
  </details>
- /uploademoji `url: <url>` `optional:name: <name>`
    - Takes in a url to either a `.gif`, `.jpg`, or `.png`, applies some image editing if needed (Such as compression,
      resizing, etc), and attempts to upload it to server as an emoji.
  <details>
    <summary>Example</summary>

  ![](https://i.imgur.com/SL47Py5.gif)
  </details>
