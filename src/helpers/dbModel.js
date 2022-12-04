import Database from 'better-sqlite3-multiple-ciphers';
import config from '../../config.json' assert { type: 'json' };

/** createDatabase
 *      Generates unique sqlite file with tables and default config settings for a unique server.
 *
 *  @param guildId      The newly joined server/guild's id.
 */
const createDatabase = async (guildId) => {
	// console.log(`createDatabase(${guildId}) called.`)

	return new Promise((resolve, reject) => {
		const db = new Database(`./databases/${guildId}.sqlite`);
		// db.pragma(`key='${config.db_key}'`);
		const createStatements = [
			'CREATE TABLE IF NOT EXISTS messageActivity(emoji TEXT, user TEXT, datetime TEXT)',
			'CREATE TABLE IF NOT EXISTS reactsSentActivity(emoji TEXT, user TEXT, datetime TEXT)',
			'CREATE TABLE IF NOT EXISTS reactsReceivedActivity(emoji TEXT, user TEXT, datetime TEXT)',
			'CREATE TABLE IF NOT EXISTS serverSettings(setting TEXT UNIQUE, flag INTEGER)',
			'CREATE TABLE IF NOT EXISTS usersOpt(user TEXT UNIQUE, flag INTEGER)',
		].map(sql => db.prepare(sql));

		for (const createStatement of createStatements) {
			createStatement.run();
		}

		const insertStatement = db.prepare('INSERT OR IGNORE INTO serverSettings (setting, flag) VALUES (@setting, @flag)');
		const insertSettings = db.transaction((settings) => {
			for (const setting of settings) insertStatement.run(setting);
		});

		insertSettings([
			{ setting: 'countmessages', flag: 1 },
			{ setting: 'countreacts', flag: 1 },
			{ setting: 'countselfreacts', flag: 1 },
			{ setting: 'allownsfw', flag: 0 },
		]);

		db.close();
		resolve('Database created.');
	});
};

/** deleteFromDb
 *      Deletes a record from a database. Uses emojiId, userId, and dateTime to find the correct record.
 *
 *  @param guildId      The server the record is associated with.
 *  @param emojiId      The record's emoji.
 *  @param userId       The record's user.
 *  @param dateTime     The record's datetime.
 *  @param table        The table to delete from.
 *  @param origin       The event from where deleteFromDb was called.
 */
const deleteFromDb = async (guildId, emojiId, userId, dateTime, table, origin) => {
	// console.log(`deleteFromDb(${guildId}, ${emojiId}, ${userId}, ${dateTime}, ${table}) called from ${origin}.`);

	return new Promise((resolve, reject) => {
		if (guildId && emojiId && userId && dateTime) {
			const db = new Database(`./databases/${guildId}.sqlite`);
			// db.pragma(`key='${config.db_key}'`);
			let statement;

			switch (table) {
			case 'messageActivity':
				statement = db.prepare(`
                    DELETE FROM messageActivity 
                    WHERE rowid = 
                    (
                        SELECT rowid
                        FROM messageActivity
                        WHERE
                            emoji = @emoji AND
                            user = @user AND
                            datetime = @datetime
                        LIMIT 1
                    )
                `);
				break;
			case 'reactsReceivedActivity':
				statement = db.prepare(`
                    DELETE FROM reactsReceivedActivity 
                    WHERE rowid = 
                    (
                        SELECT rowid
                        FROM reactsReceivedActivity
                        WHERE
                            emoji = @emoji AND
                            user = @user AND
                            datetime = @datetime
                        LIMIT 1
                    )
                `);
				break;
			case 'reactsSentActivity':
				statement = db.prepare(`
                    DELETE FROM reactsSentActivity 
                    WHERE rowid = 
                    (
                        SELECT rowid
                        FROM reactsSentActivity
                        WHERE
                            emoji = @emoji AND
                            user = @user AND
                            datetime = @datetime
                        LIMIT 1
                    )
                `);
				break;
			}

			statement.run({
				emoji: emojiId,
				user: userId,
				datetime: dateTime,
			});

			db.close();
			resolve('Record deleted.');
		}
		else {
			// console.log(`deleteFromDb: Cancel delete. (${guildId}, ${emojiId}, ${userId}, ${dateTime}, ${table}, ${origin})`);
			reject('deleteFromDb: Cancel delete.');
		}
	});
};

/** insertToDb
 *      Inserts a record to a database. Inserts a row of {emojiId, userId, dateTime}.
 *
 *  @param guildId      The server to associate the record with.
 *  @param emojiId      The record's emoji.
 *  @param userId       The record's user.
 *  @param dateTime     The record's datetime.
 *  @param table        The table to insert to.
 *  @param origin       The event from where insertToDb was called.
 */
const insertToDb = async (guildId, emojiId, userId, dateTime, table, origin) => {
	// console.log(`insertToDb(${guildId}, ${emojiId}, ${userId}, ${dateTime}, ${table}) called from ${origin}.`);
	return new Promise((resolve, reject) => {
		if (guildId && emojiId && userId && dateTime) {
			const db = new Database(`./databases/${guildId}.sqlite`);
			// db.pragma(`key='${config.db_key}'`);
			let statement;

			switch (table) {
			case 'messageActivity':
				statement = db.prepare(`
                    INSERT INTO messageActivity (emoji, user, datetime) 
                    VALUES (@emoji, @user, @datetime)
                `);
				break;
			case 'reactsReceivedActivity':
				statement = db.prepare(`
                    INSERT INTO reactsReceivedActivity (emoji, user, datetime) 
                    VALUES (@emoji, @user, @datetime)
                `);
				break;
			case 'reactsSentActivity':
				statement = db.prepare(`
                    INSERT INTO reactsSentActivity (emoji, user, datetime) 
                    VALUES (@emoji, @user, @datetime)
                `);
				break;
			}

			statement.run({
				emoji: emojiId,
				user: userId,
				datetime: dateTime,
			});

			db.close();
			resolve('Record inserted.');
		}
		else {
			console.log(`insertToDb: Cancel insert. (${guildId}, ${emojiId}, ${userId}, ${dateTime}, ${table}, ${origin})`);
			reject('insertToDb: Cancel insert.');
		}
	});
};

/** getLeaderboard
 *      Returns the top 10 users for a specific emoji's usage at a (un?)specified datetime range.
 *
 *  @param guildId   The server the records are associated with.
 *  @param emojiId   The emoji to query records for.
 *  @param clientId  The bot; to ignore, so it only queries for other users records.
 *  @param type      The type of leaderboard to display. Either 'Sent' or 'Received' emojis leaderboard.
 *  @param dateTime  The date range to query records for.
 *  @returns {*}     Returns a collection of records of {user, count}
 */
const getLeaderboard = async (guildId, emojiId, clientId, type, dateTime = null) => {
	return new Promise((resolve, reject) => {
		const db = new Database(`./databases/${guildId}.sqlite`);
		// db.pragma(`key='${config.db_key}'`);
		let cat;
		let statement;
		if (dateTime) { // Query for if a daterange was specified
			if (type === 'sent') {
				statement = db.prepare(`
					SELECT 
						user,
						COUNT(emoji) 
					FROM
						(
							SELECT 
								*
							FROM 
								messageActivity
							UNION ALL
							SELECT
								*
							FROM
								reactsSentActivity
						)
					WHERE 
						emoji = @emojiId
						AND user IS NOT @clientId
						AND datetime > @dateTime
					GROUP BY 
						user
					ORDER BY 
						COUNT(emoji) DESC
					LIMIT 10;
				`);
			}
			else if (type === 'received') {
				statement = db.prepare(`
					SELECT
						user,
						COUNT(emoji)
					FROM
						reactsReceivedActivity
					WHERE 
						emoji = @emojiId
						AND user IS NOT @clientId
						AND datetime > @dateTime
					GROUP BY 
						user
					ORDER BY 
						COUNT(emoji) DESC
					LIMIT 10;
				`);
			}
			cat = statement.all({
				emojiId: emojiId,
				clientId: clientId,
				dateTime: dateTime,
			});
		}
		else { // Query for if a daterange was NOT specified
			if (type === 'sent') {
				statement = db.prepare(`
					SELECT 
						user,
						COUNT(emoji)
					FROM
						(
							SELECT 
								*
							FROM 
								messageActivity
							UNION ALL
							SELECT
								*
							FROM
								reactsSentActivity
						)
					WHERE 
						emoji = @emojiId
						AND user IS NOT @clientId
					GROUP BY 
						user
					ORDER BY 
						COUNT(emoji) DESC
					LIMIT 10;
				`);
			}
			else if (type === 'received') {
				statement = db.prepare(`
					SELECT 
						user,
						COUNT(emoji) 
					FROM 
						reactsReceivedActivity
					WHERE 
						emoji = @emojiId
						AND user IS NOT @clientId
					GROUP BY 
						user
					ORDER BY 
						COUNT(emoji) DESC
					LIMIT 10;
				`);
			}
			cat = statement.all({
				emojiId: emojiId,
				clientId: clientId,
			});
		}

		db.close();
		resolve(cat);
	});
};

/** getGetCount
 *      Returns total emojis' usage within a specified date range for either an entire server or a specified user.
 *
 * @param guildId       The server the records are associated with.
 * @param userId        The user to query for.
 * @param dateTime      The date range to query for.
 * @returns {number}    Returns the usage number of the queried user/server.
 */
const getGetCount = async (guildId, userId, dateTime) => {
	return new Promise((resolve, reject) => {
		// console.log(`getGetCount(${guildId}, ${userId}, ${dateTime}) called.`);
		const db = new Database(`./databases/${guildId}.sqlite`);
		// db.pragma(`key='${config.db_key}'`);
		let count = 0;
		if (userId !== null) { // Query for server
			const statements = [
				'SELECT COUNT(emoji) FROM messageActivity WHERE user = @user AND datetime > @datetime',
				'SELECT COUNT(emoji) FROM reactsSentActivity WHERE user = @user AND datetime > @datetime',
			].map(sql => db.prepare(sql));
			for (const statement of statements) {
				count += Object.values(statement.get({ user: userId, datetime: dateTime }))[0];
			}
		}
		else { // Query for a user
			const statements = [
				'SELECT COUNT(emoji) FROM messageActivity WHERE datetime > @datetime',
				'SELECT COUNT(emoji) FROM reactsSentActivity WHERE datetime > @datetime',
			].map(sql => db.prepare(sql));
			for (const statement of statements) {
				count += Object.values(statement.get({ datetime: dateTime }))[0];
			}
		}

		db.close();
		resolve(count);
	});
};

/** getDisplayStats
 *      Returns the usage for each emoji in a server for either the server or a specified user.
 *
 * @param guildId   The server the records are associated with.
 * @param dateTime  The date range to query for.
 * @param userId    The user to query for.
 * @returns {*}     Returns a collection of {emoji, count}
 */
const getDisplayStats = async (guildId, dateTime, userId = null) => {
	return new Promise((resolve, reject) => {
		const db = new Database(`./databases/${guildId}.sqlite`);
		// db.pragma(`key='${config.db_key}'`);
		let cat;

		if (userId) {
			const statement = db.prepare(`
				SELECT 
					emoji,
					COUNT(emoji) 
				FROM 
					(
						SELECT 
							*
						FROM 
							messageActivity
						UNION ALL
						SELECT
							*
						FROM
							reactsSentActivity
					)
				WHERE 
					user = @user
					AND datetime > @datetime
				GROUP BY emoji
				ORDER BY COUNT(emoji) DESC
			`);
			cat = statement.all({
				user: userId,
				datetime: dateTime,
			});
		}
		else {
			const statement = db.prepare(`
				SELECT 
					emoji,
					COUNT(emoji) 
				FROM 
					(
						SELECT 
							*
						FROM 
							messageActivity
						UNION ALL
						SELECT
							*
						FROM
							reactsSentActivity
					)
				WHERE datetime > @datetime
				GROUP BY emoji
				ORDER BY COUNT(emoji) DESC
			`);
			cat = statement.all({
				datetime: dateTime,
			});
		}

		db.close();
		resolve(cat);
	});
};

/** getSetting
 *      Returns the flag state for a server's config setting.
 *
 * @param guildId                       The server the record is associated with.
 * @param setting                       The setting flag to get.
 * @returns {*|number|string|OpenMode}  The flag's state.
 */
const getSetting = async (guildId, setting) => {
	return new Promise((resolve, reject) => {
		const db = new Database(`./databases/${guildId}.sqlite`);
		// db.pragma(`key='${config.db_key}'`);
		const statement = db.prepare('SELECT flag FROM serverSettings WHERE setting = ?');
		const flag = statement.get(setting).flag;
		db.close();
		resolve(flag);
	});
};

/** setSetting
 *      Modifies a server's config setting.
 *
 * @param guildId   The server to insert the setting record to.
 * @param setting   The setting to modify.
 * @param flag      The flag state to set.
 */
const setSetting = async (guildId, setting, flag) => {
	return new Promise((resolve, reject) => {
		const db = new Database(`./databases/${guildId}.sqlite`);
		// db.pragma(`key='${config.db_key}'`);
		const statement = db.prepare(`
			UPDATE serverSettings
			SET flag = @flag
			WHERE setting = @setting
		`);
		statement.run({
			setting: setting,
			flag: flag,
		});
		db.close();
		resolve('Setting set.');
	});
};

/** resetDb
 *      Truncates all tables, deleting all records.
 *
 * @param guildId   The guild to reset db's on.
 */
const resetDb = async (guildId) => {
	return new Promise((resolve, reject) => {
		const db = new Database(`./databases/${guildId}.sqlite`);
		// db.pragma(`key='${config.db_key}'`);

		const deleteStatements = [
			'DELETE FROM messageActivity',
			'DELETE FROM reactsSentActivity',
			'DELETE FROM reactsReceivedActivity',
		].map(sql => db.prepare(sql));

		for (const deleteStatement of deleteStatements) {
			deleteStatement.run();
		}

		db.close();
		resolve('Database reset.');
	});
};

/** getEmojiTotalCount
 *      Returns the amount of times a specific emoji has been used in total.
 * @param guildId       The server the record is associated with.
 * @param emojiId       The emoji to search for.
 * @returns {number}    The usage count of the emoji.
 */
const getEmojiTotalCount = async (guildId, emojiId) => {
	return new Promise((resolve, reject) => {
		const db = new Database(`./databases/${guildId}.sqlite`);
		// db.pragma(`key='${config.db_key}'`);
		let count = 0;

		const statements = [
			'SELECT COUNT(emoji) FROM messageActivity WHERE emoji == @emoji',
			'SELECT COUNT(emoji) FROM reactsSentActivity WHERE emoji == @emoji',
		].map(sql => db.prepare(sql));
		for (const statement of statements) {
			count += Object.values(statement.get({ emoji: emojiId }))[0];
		}

		db.close();
		resolve(count);
	});
};


/**	getOpt
 * 		Returns whether user has opted-in (true) or opted-out (false) of emoji usage logging.
 * @param guildId       The server the record is associated with.
 * @param userId    	The user to query for.
 * @returns {*|number|OpenMode|string|boolean}	A truthy value of user opt-in/out.
 */
const getOpt = async (guildId, userId) => {
	return new Promise((resolve, reject) => {
		const db = new Database(`./databases/${guildId}.sqlite`);
		// db.pragma(`key='${config.db_key}'`);
		const statement = db.prepare('SELECT flag FROM usersOpt WHERE user = ?');
		resolve(statement.get(userId).flag);
	});
};

/**	setOpt
 * 		Sets user opt-in/out from emoji usage logging.
 * @param guildId       The server the record is associated with.
 * @param userId    	The user to set flag for.
 * @param flag			The flag state to set.
 */
const setOpt = async (guildId, userId, flag) => {
	return new Promise((resolve, reject) => {
		const db = new Database(`./databases/${guildId}.sqlite`);
		// db.pragma(`key='${config.db_key}'`);
		const statement = db.prepare('REPLACE INTO usersOpt (user, flag) VALUES (@user, @flag)');

		// console.log(`setOpt(${guildId}, ${userId}, ${Number(flag)}) called.`);

		statement.run({
			user: userId,
			flag: Number(flag),
		});
		db.close();
		resolve('User opt set.');
	});
};

/**	clearUserFromDb
 * 		Removes all records of a user from the emoji usage logging databases.
 * @param guildId	The guild to remove the user from.
 * @param userId	The user to remove records of.
 */
const clearUserFromDb = async (guildId, userId) => {
	return new Promise((resolve, reject) => {
		const db = new Database(`./databases/${guildId}.sqlite`);
		// db.pragma(`key='${config.db_key}'`);

		const statements = [
			'DELETE FROM messageActivity WHERE user = @user',
			'DELETE FROM reactsSentActivity WHERE user = @user',
			'DELETE FROM reactsReceivedActivity WHERE user = @user',
		].map(sql => db.prepare(sql));

		for (const statement of statements) {
			statement.run({ user: userId });
		}

		db.close();
		resolve('User cleared from database.');
	});
};

export {
	createDatabase,
	deleteFromDb,
	insertToDb,
	getLeaderboard,
	getGetCount,
	getDisplayStats,
	getSetting,
	setSetting,
	resetDb,
	getEmojiTotalCount,
	getOpt,
	setOpt,
	clearUserFromDb,
};