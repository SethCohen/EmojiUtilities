const Database = require('better-sqlite3')

function createDatabase(guildId) {
    // console.log(`createDatabase(${guildId}) called.`)

    let db = new Database(`./databases/${guildId}.sqlite`);

    const createStatements = [
        `CREATE TABLE IF NOT EXISTS emojiActivity(emoji TEXT, person TEXT, datetime TEXT)`,
        `CREATE TABLE IF NOT EXISTS serverSettings(setting TEXT, flag INTEGER)`,
    ].map(sql => db.prepare(sql))
    for (const createStatement of createStatements) {
        createStatement.run();
    }

    const insertStatement = db.prepare(`INSERT INTO serverSettings (setting, flag) VALUES (@setting, @flag)`)
    const insertSettings = db.transaction((settings) => {
        for (const setting of settings) insertStatement.run(setting)
    })
    insertSettings([
        {setting: 'countmessages', flag: 1},
        {setting: 'countreacts', flag: 1},
        {setting: 'countselfreacts', flag: 1},
    ])

    db.close()
}

function deleteFromDb(guildId, emojiId, personId, dateTime) {
    // console.log(`deleteFromDb(${guildId}, ${emojiId}) called.`)
    let db = new Database(`./databases/${guildId}.sqlite`);
    const statement = db.prepare(`
        DELETE FROM emojiActivity 
        WHERE rowid = 
        (
            SELECT rowid
            FROM emojiActivity
            WHERE
                emoji = @emoji AND
                person = @person AND
                datetime = @datetime
            LIMIT 1
        )
    `)
    statement.run({
        emoji: emojiId,
        person: personId,
        datetime: dateTime
    })
    db.close()

}

function insertToDb(guildId, emojiId, personId, dateTime) {
    // console.log(`insertToDb(${guildId}, ${emojiId}) called.`)
    let db = new Database(`./databases/${guildId}.sqlite`);
    const statement = db.prepare(`
        INSERT INTO emojiActivity (emoji, person, datetime) 
        VALUES (@emoji, @person, @datetime)
    `)
    statement.run({
        emoji: emojiId,
        person: personId,
        datetime: dateTime
    })
    db.close()

}

function getLeaderboard(guildId, emojiId, clientId, dateTime = null) {
    // console.log(`getLeaderboard(${guildId}, ${emojiId}, ${clientId}, ${dateTime}) called.`)
    let db = new Database(`./databases/${guildId}.sqlite`);
    let cat
    if (dateTime) {
        let statement = db.prepare(`
            SELECT 
                person,
                COUNT(emoji) 
            FROM 
                emojiActivity
            WHERE 
                emoji = @emojiId
                AND person IS NOT @clientId
                AND datetime > @dateTime
            GROUP BY 
                person
            ORDER BY 
                COUNT(emoji) DESC
            LIMIT 10;
        `)
        cat = statement.all({
            emojiId: emojiId,
            clientId: clientId,
            dateTime: dateTime,
        })
    } else {
        let statement = db.prepare(`
            SELECT 
                person,
                COUNT(emoji) 
            FROM 
                emojiActivity
            WHERE 
                emoji = @emojiId
                AND person IS NOT @clientId
            GROUP BY 
                person
            ORDER BY 
                COUNT(emoji) DESC
            LIMIT 10;
        `)
        cat = statement.all({
            emojiId: emojiId,
            clientId: clientId
        })
    }
    // console.log(cat)
    db.close()
    return cat

}

function getGetCount(guildId, userId, dateTime) {
    // console.log(`getGetCount(${guildId}, ${userId}, ${dateTime}) called.`)
    let db = new Database(`./databases/${guildId}.sqlite`);
    let count
    if (userId !== null) {
        let statement = db.prepare(`
            SELECT COUNT(emoji) 
            FROM emojiActivity
            WHERE person = @person AND
            datetime > @datetime
        `)
        count = statement.get({person: userId, datetime: dateTime,})
    } else {
        let statement = db.prepare(`
            SELECT COUNT(emoji) 
            FROM emojiActivity
            WHERE datetime > @datetime
        `)
        count = statement.get({datetime: dateTime,})
    }
    db.close()
    return Object.values(count)[0]


}

function getDisplayStats(guildId, dateTime, userId = null) {
    // console.log(`getDisplayStats(${guildId}, ${dateTime}, ${userId}) called.`)

    let db = new Database(`./databases/${guildId}.sqlite`);
    let cat
    if (userId) {
        let statement = db.prepare(`
            SELECT 
                emoji,
                COUNT(emoji) 
            FROM emojiActivity
            WHERE 
                person = @person
                AND datetime > @datetime
            GROUP BY emoji
            ORDER BY COUNT(emoji) DESC
        `)
        cat = statement.all({
            person: userId,
            datetime: dateTime,
        })
    } else {
        let statement = db.prepare(`
            SELECT 
                emoji,
                COUNT(emoji) 
            FROM emojiActivity
            WHERE datetime > @datetime
            GROUP BY emoji
            ORDER BY COUNT(emoji) DESC
        `)
        cat = statement.all({
            datetime: dateTime,
        })
    }
    db.close()
    return cat
}

function getSetting(guildId, setting) {
    let db = new Database(`./databases/${guildId}.sqlite`);
    const statement = db.prepare(`SELECT flag FROM serverSettings WHERE setting = ?`)
    const flag = statement.get(setting).flag
    db.close()
    return flag
}

function setSetting(guildId, setting, flag) {
    let db = new Database(`./databases/${guildId}.sqlite`);
    const statement = db.prepare(`
        UPDATE serverSettings
        SET flag = @flag
        WHERE setting = @setting
    `)
    statement.run({
        setting: setting,
        flag: flag,
    })
    db.close()
}

module.exports = {
    createDatabase,
    deleteFromDb,
    insertToDb,
    getLeaderboard,
    getGetCount,
    getDisplayStats,
    getSetting,
    setSetting
}