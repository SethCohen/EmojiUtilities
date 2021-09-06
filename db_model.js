const Database = require('better-sqlite3')

function createDatabase(guildId) {
    console.log(`createDatabase(${guildId}) called.`)

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

function deleteFromDb(guildId, interaction, emojiId) {
    console.log(`deleteFromDb(${interaction}, ${emojiId}) called.`)

}

function insertToDb(guildId, emojiId, personId, dateTime) {
    console.log(`insertToDb(${guildId}, ${emojiId}) called.`)
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

function getLeaderboard(guildId, interaction, emojiId) {
    console.log(`getLeaderboard(${interaction}, ${emojiId}) called.`)

}

function getGetCount(guildId, interaction, user = null) {
    console.log(`getGetCount(${interaction}, ${user}) called.`)
    // query for all time, yearly, monthly, weekly, daily

}

function getDisplayStats(guildId, interaction, dateRange = null, user = null) {
    console.log(`getDisplayStats(${interaction}, ${dateRange}, ${user}) called.`)
    // default to server if no user
}

function getSettingFlag(guildId, setting){
    let db = new Database(`./databases/${guildId}.sqlite`);
    const statement = db.prepare(`SELECT flag FROM serverSettings WHERE setting = ?`)
    const flag = statement.get(setting).flag
    db.close()
    return flag
}

module.exports = {createDatabase, deleteFromDb, insertToDb, getLeaderboard, getGetCount, getDisplayStats, getSettingFlag}