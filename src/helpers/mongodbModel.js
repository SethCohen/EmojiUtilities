async function insertGuild(db, guild) {
  try {
    const guildSettingsCollection = db.collection('guilds');

    const newGuild = {
      _id: guild.id,
      name: guild.name,
      settings: {
        countmessages: true,
        countreacts: true,
        countselfreacts: true,
        allownsfw: true,
      },
      usersOpt: [],
    };

    await guildSettingsCollection.insertOne(newGuild);
    console.log(`New guild {${guild.id}, ${guild.name}} inserted.`);
  } catch (error) {
    if (!error.message.toString().includes('MongoServerError: E11000 duplicate key error')) console.error('Error inserting guild:', error);
  }
}

async function addEmojiRecord(db, emojiRecord) {
  return await db.collection('emoji_records').insertOne(emojiRecord);
}

async function addEmojiRecords(db, emojiRecords) {
  return await db.collection('emoji_records').insertMany(emojiRecords);
}

async function deleteEmojiRecord(db, emojiRecord) {
  return await db.collection('emoji_records').deleteOne(emojiRecord);
}

async function deleteEmojiRecords(db, filter) {
  return await db.collection('emoji_records').deleteMany(filter);
}

const getEmojiTotalCount = async (db, guildId, emojiId) => {
  try {
    const result = await db
      .collection('emoji_records')
      .aggregate([
        { $match: { guild: guildId, emoji: emojiId } },
        { $group: { _id: null, count: { $sum: 1 } } },
      ])
      .toArray();

    if (result.length > 0) {
      return result[0].count;
    } else {
      return 0;
    }
  } catch (e) {
    console.error('Error while getting emoji total count:', e);
    return 0;
  }
};

async function getGuildInfo(db, guild) {
  const guildInfo = await db.collection('guilds').findOne({ _id: guild.id });
  if (guildInfo === null) {
    console.log(guildInfo)
    await insertGuild(db, guild);
  }
  return guildInfo;
}

async function getGetCount(db, guildId, userId, dateTime) {
  try {
    const emojiRecordsCollection = db.collection('emoji_records');

    const matchStage = userId
      ? {
          $match: {
            guild: guildId,
            user: userId,
            date: { $gt: new Date(dateTime) },
          },
        }
      : {
          $match: {
            guild: guildId,
            date: { $gt: new Date(dateTime) },
          },
        };

    const groupStage = {
      $group: {
        _id: '$emoji',
        count: { $sum: 1 },
      },
    };

    const totalCountStage = {
      $group: {
        _id: null,
        totalCount: { $sum: '$count' },
      },
    };

    const results = await emojiRecordsCollection
      .aggregate([matchStage, groupStage, totalCountStage])
      .toArray();

    if (results.length > 0) {
      return results[0].totalCount;
    } else {
      return 0;
    }
  } catch (e) {
    console.error('Error while getting getCount:', e);
    return 0;
  }
}

async function setSetting(db, guildId, setting, flag) {
    const guildsCollection = db.collection('guilds');

    await guildsCollection.updateOne(
      { _id: guildId },
      { $set: { [`settings.${setting}`]: flag } }
    );
}

async function getDisplayStats(db, guildId, dateTime, userId = null) {
  try {
    const emojiRecordsCollection = db.collection('emoji_records');

    const matchCondition = {
      guild: guildId,
      date: { $gt: new Date(dateTime) },
      tag: { $in: ['message', 'sent-reaction'] },
    };
    if (userId) {
      matchCondition.user = userId;
    }

    const pipeline = [
      { $match: matchCondition },
      { $group: { _id: '$emoji', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ];

    const result = await emojiRecordsCollection.aggregate(pipeline).toArray();
    return result.map((item) => ({ emoji: item._id, count: item.count }));
  } catch (e) {
    console.error('Error while getting display stats:', e);
    throw e;
  }
}

async function getLeaderboard(db, guildId, emojiId, clientId, type, dateTime = null) {
  try {
    const emojiRecordsCollection = db.collection('emoji_records');

    const matchCondition = {
      guild: guildId,
      emoji: emojiId,
      user: { $ne: clientId },
    };
    if (dateTime) {
      matchCondition.date = { $gt: new Date(dateTime) };
    }

    const pipeline = [
      { $match: matchCondition },
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ];

    if (type === 'received') {
      // Since the given code only covers 'sent' type, you may need to modify the pipeline
      // to handle 'received' type based on your application logic and data model
    }

    const result = await emojiRecordsCollection.aggregate(pipeline).toArray();

    return result.map((item) => ({ user: item._id, count: item.count }));
  } catch (e) {
    console.error('Error while getting leaderboard:', e);
    throw e;
  }
}

async function setOpt(db, guildId, userId, flag) {
  try {
    const guildSettingsCollection = db.collection('guilds');

    // Try to update an existing user's flag
    const result = await guildSettingsCollection.updateOne(
      { _id: guildId, 'usersOpt.user': userId },
      {
        $set: {
          'usersOpt.$.flag': flag,
        },
      }
    );

    // If the user was not updated in the previous operation, insert the user with the flag
    if (result.matchedCount === 0) {
      await guildSettingsCollection.updateOne(
        { _id: guildId },
        {
          $addToSet: {
            usersOpt: { user: userId, flag: flag },
          },
        }
      );
    }

    console.log('User opt set.');
  } catch (error) {
    console.error('Error setting user opt:', error);
    throw error;
  }
}

async function clearUserFromDb(db, guildId, userId) {
  try {
    const emojiRecordsCollection = db.collection('emoji_records');

    await emojiRecordsCollection.deleteMany({
      guild: guildId,
      user: userId,
    });

    console.log('User cleared from database.');
  } catch (error) {
    console.error('Error clearing user from database:', error);
    throw error;
  }
}

async function resetDb(db, guildId) {
  try {
    const emojiRecordsCollection = db.collection('emoji_records');

    await emojiRecordsCollection.deleteMany({ guild: guildId });

    console.log('Database reset.');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
}

export {
  insertGuild,
  addEmojiRecord,
  deleteEmojiRecord,
  getEmojiTotalCount,
  getGuildInfo,
  getGetCount,
  setSetting,
  getDisplayStats,
  getLeaderboard,
  setOpt,
  clearUserFromDb,
  resetDb,
  addEmojiRecords,
  deleteEmojiRecords,
};
