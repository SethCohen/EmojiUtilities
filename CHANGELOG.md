# Changelog

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

