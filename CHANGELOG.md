# Changelog

## [1.4.0] - 2021-09-08
### Added
- Added javascript events `ready.js`, `messageUpdate.js`, `messageReactionRemoveAll.js`, `messageReactionRemove.js`, `messageReactionAdd.js`, `messageDeleteBulk.js`, `messageDelete.js`, `messageCreate.js` basic implementations. [db99461][db99461]
- Added javascript commands `leaderboard.js`, `config.js` basic implementations. [db99461][db99461]
- Added basic `better-sqlite3` support with basic events implementation `getSettingFlag`, `getDisplayStats`, `getGetCount`, `getLeaderboard`, `insertToDb`, `deleteFromDb`, `createDatabase` [cc9d24a][cc9d24a]
- Added `serverSettings(setting TEXT, flag INTEGER)` table for server configs. [cc9d24a][cc9d24a]
- Added `insertToDb` functionality and `messageCreate` functionality. [f5cecd8][f5cecd8]
- Added `deleteFromDb` functionality and `messageDelete` and `messageBulkDelete` functionality. [bff973a][bff973a]
- Added `messageReactionAdd` functionality with `insertToDb`. [be2dad4][be2dad4]
- Added `messageReactionRemove` functionality with `deleteFromDb`. [0c3619b][0c3619b]
- Added `messageReactionRemoveAll` functionality with `deleteFromDb`. [c48a55a][c48a55a]
- Added `messageUpdate` functionality with both `insertToDb` and `deleteFromDb`. [d7037e3][d7037e3]
- Added `config` command functionality with `setSetting` implementation. [f6e2c32][f6e2c32]
- Added `listemoji` command functionality. [fe76b9b][fe76b9b]
- Added `getCount` command functionality. [225ac9a][225ac9a]
- Added `getGetCount` sqlite query functionality. [225ac9a][225ac9a]
- Added `leaderboard` command functionality. [bd0e632][bd0e632]
- Added `getLeaderboard` sqlite query functionality. [bd0e632][bd0e632]
- Added `displaystats` command functionality with Buttons. [33367fb][33367fb]
- Added `getDisplayStats` sqlite query functionality. [33367fb][33367fb]
- `displaystats.js` Added page number on footer. [a66a324][a66a324]
- `guildCreate.js` Added welcome message on bot guild join. [a66a324][a66a324]


### Changed
- Ported everything over to discord.js and javascript.
- `getSettingFlag` into `getSetting. [f6e2c32][f6e2c32]
- `config.js` command response to more readable text. [fe76b9b][fe76b9b]
- `listemoji.js` command sends plain messages instead of responses. [33367fb][33367fb]

### Fixed
- `messageReactionAdd.js` Get reaction's author instead of message author of the reaction [c48a55a][c48a55a]
- `messageReactionRemove.js` Get reaction's author instead of message author of the reaction [c48a55a][c48a55a]
- `displaystats.js` Catch invalid/undefined emoji error. [856a7a4][856a7a4]
- `leaderboard.js` Catch invalid/undefined user error. [856a7a4][856a7a4]

### Removed
- `displaystats.js` Removed Yearly daterange. [33367fb][33367fb]
- `guildCreate.js` Removed attempt to post to admin/system channel. [4c29121][4c29121]

## [1.3.9] - 2021-09-04
### Added
- `ES docountmessages` command; available flags `true` or `false`
### Changed
- `on_message` now considers do_count_messages flag when adding to db.
- `on_message_remove` now considers do_count_messages flag when adding to db.
- `ES help` Updated to include docountmessages command info.
- `ES help` Updated to fix displaystats

## [1.3.8] - 2021-09-04
### Added
- `ES doselfreact` command; available flags `true` or `false`
### Changed
- `on_reaction_add` now consider do_self_react flag when adding to db.
- `on_reaction_remove` now consider do_self_react flag when adding to db.
- `ES help` Updated to include doselfreact command info.

## [1.3.7] - 2021-06-17
### Fixed
- IDE warnings about unused parameters.

## [1.3.6] - 2021-06-16
### Changed
- `bot.py` Refactored all inserts/deletes from db to use emoji's unique id rather than full name.
- `db_model.py` Refactored get_leaderboard to query for emoji's id.
- `db_model.py` Refactored console Record Removed log to use author id rather than author name.
- `displaystats.py` Refactored embed to use emoji object rather than queried db emoji id string.

## [1.3.5] - 2021-06-13
### Changed
- `db_model.py` switched leaderboard check for if bot from bot's name to bot's unique id.
- Updated help command/`help.py`; added Support server link.
- Updated leaderboard/`leaderboard.py`; added catch for new vs old database systems. If retrieved data is a user id, get username. If retrieved data is a username, display as normal.

## [1.3.4] - 2021-06-12
- Fixed databases, switched from storing emoji usage by username to storing by user id for cases where the user changes their actual username rather than server-nick.
- Minor code cleanup; mainly removing commented out code.

## [1.3.3] - 2021-06-09
- Moved help command to its own file; `help.py`.
- Fixed bot message-on-join.
- Updated all commands and all database queries with user queries to use the user's unique ID rather than mention.

## [1.3.2] - 2021-05-26
- Even more code refactoring
- Moved more `bot.py` sqlite queries to `db_model.py`
- `create_db`, `insert_to_db`, and `delete_from_db` functions created
- `displaystats.py` edited; added automatic user reaction removal on arrow press.

## [1.3.1] - 2021-05-25
- More code refactoring
- Continuation of extension-based commands
	- Created displaystats.py
	- Created listemojis.py

## [1.3.0] - 2021-05-22
- Start of Extensions-based commands
	- Created `getcount.py`
	- Created `leaderboard.py`
- Start of separating sqlite queries into its own file
	- Created `db_model.py`
- Refactored a lot of code

## [1.2.5] - 2020-12-13
- Added help subcommand to `ES help`

## [1.2.4] - 2020-12-13
- Added position indicator to leaderboard.

## [1.2.3] - 2020-12-11
- Fix for previous changelog; NOW checks & PROPERLY removes for if bot is on leaderboad.

## [1.2.2] - 2020-12-11
- Quick fix for 'leaderboard', checks & removes for if bot is on leaderboard.

## [1.2.1] - 2020-12-11
- Added `leaderboard` command to `ES help`
- Fixed `leaderboard` inline display; set to False

## [1.2.0] - 2020-12-11
- Added `leaderboard` command
	- Displays the top ten users who use the specified emoji the most
- Fixed `getcount` error handling

## [1.1.1] - 2020-12-11
- Added error handling for `getcount` and `displaystats`

## [1.1.0] - 2020-12-11
- Added `getcount` command.
	- Displays total emoji count usage at all-time, monthly, and weekly usage; defaults to server's usage if user is not specified.

## [1.0.1] - 2020-12-03
- Added next/prev page reaction removal on timeout for the `displaystats` command.
- Fixed bug for next/prev page reaction removal.

## [< 1.0.0] - Pre 2020-11-22
Added complete functionality

[db99461]: https://github.com/SethCohen/EmojiStatistics/commit/db99461cafb5371cc85b70f0ec0743be813f7dd6
[cc9d24a]: https://github.com/SethCohen/EmojiStatistics/commit/cc9d24ad9b942dea684aced1d741f721290ebd09
[f5cecd8]: https://github.com/SethCohen/EmojiStatistics/commit/f5cecd895348d7db500572fdb521361ce33a7173
[bff973a]: https://github.com/SethCohen/EmojiStatistics/commit/bff973a294067406f5f37b88a377e7f9b9aee9c4
[be2dad4]: https://github.com/SethCohen/EmojiStatistics/commit/be2dad4779d25d01f0a09b235b7af574436b9e7f
[0c3619b]: https://github.com/SethCohen/EmojiStatistics/commit/0c3619bb5faa151daddc11d84b87f2fc3f747c93
[c48a55a]: https://github.com/SethCohen/EmojiStatistics/commit/c48a55a04dde50a06658abfe0203cb7d0af6cd4b
[d7037e3]: https://github.com/SethCohen/EmojiStatistics/commit/d7037e3e165b0be3e3b742cb66bebb16d686bbab
[f6e2c32]: https://github.com/SethCohen/EmojiStatistics/commit/f6e2c3232c002414335e50d05302a23897de1d35
[fe76b9b]: https://github.com/SethCohen/EmojiStatistics/commit/fe76b9b800c1159ee06a940988e561cdf05ffafb
[225ac9a]: https://github.com/SethCohen/EmojiStatistics/commit/225ac9aaaf6d9590688a74f7d286d1ae8d433417
[bd0e632]: https://github.com/SethCohen/EmojiStatistics/commit/bd0e63296a4877fc9b78839711c174a0e453557c
[33367fb]: https://github.com/SethCohen/EmojiStatistics/commit/33367fb9b8eb8c7ca9249e1b23459d036d5b5532
[a66a324]: https://github.com/SethCohen/EmojiStatistics/commit/a66a3248a0237361527e5129b5132688d947706b
[856a7a4]: https://github.com/SethCohen/EmojiStatistics/commit/856a7a4c5aeee05fefed62e5a425bbfaf03f75fb
[4c29121]: https://github.com/SethCohen/EmojiStatistics/commit/4c291215672e5b99a3edc8086ce082f368e1250e