# Changelog

### 1.3.5 - June 13, 2021
- Updated `db_model.py` switched leaderboard check for if bot from bot's name to bot's unique id.
- Updated help command/`help.py`; added Support server link.
- Updated leaderboard/`leaderboard.py`; added catch for new vs old database systems. If retrieved data is a user id, get username. If retrieved data is a username, display as normal.

### 1.3.4 - June 12, 2021
- Fixed databases, switched from storing emoji usage by username to storing by user id for cases where the user changes their actual username rather than server-nick.
- Minor code cleanup; mainly removing commented out code.

### 1.3.3 - June 9, 2021
- Moved help command to its own file; `help.py`.
- Fixed bot message-on-join.
- Updated all commands and all database queries with user queries to use the user's unique ID rather than mention.

### 1.3.2 - May 26, 2021
- Even more code refactoring
- Moved more `bot.py` sqlite queries to `db_model.py`
- `create_db`, `insert_to_db`, and `delete_from_db` functions created
- `displaystats.py` edited; added automatic user reaction removal on arrow press.

### 1.3.1 - May 25, 2021
- More code refactoring
- Continuation of extension-based commands
	- Created displaystats.py
	- Created listemojis.py

### 1.3.0 - May 22, 2021
- Start of Extensions-based commands
	- Created `getcount.py`
	- Created `leaderboard.py`
- Start of separating sqlite queries into its own file
	- Created `db_model.py`
- Refactored a lot of code

### 1.2.5 - Dec 13, 2020
- Added help subcommand to `ES help`

### 1.2.4 - Dec 13, 2020
- Added position indicator to leaderboard.

### 1.2.3 - Dec 11, 2020
- Fix for previous changelog; NOW checks & PROPERLY removes for if bot is on leaderboad.

### 1.2.2 - Dec 11, 2020
- Quick fix for 'leaderboard', checks & removes for if bot is on leaderboard.

### 1.2.1 - Dec 11, 2020
- Added `leaderboard` command to `ES help`
- Fixed `leaderboard` inline display; set to False

### 1.2.0 - Dec 11, 2020
- Added `leaderboard` command
	- Displays the top ten users who use the specified emoji the most
- Fixed `getcount` error handling

### 1.1.1 - Dec 11, 2020
- Added error handling for `getcount` and `displaystats`

### 1.1.0 - Dec 11, 2020
- Added `getcount` command.
	- Displays total emoji count usage at all-time, monthly, and weekly usage; defaults to server's usage if user is not specified.

### 1.0.1 - Dec 3, 2020
- Added next/prev page reaction removal on timeout for the `displaystats` command.
- Fixed bug for next/prev page reaction removal.

### < 1.0.0 - Pre Nov 22, 2020
Added complete functionality

