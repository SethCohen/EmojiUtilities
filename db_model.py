import sqlite3


def create_database(guild):
    try:
        # Creates database for server
        db_path = 'databases/' + str(guild) + '.sqlite'
        db_conn = sqlite3.connect(db_path)
        db_cursor = db_conn.cursor()
        db_cursor.execute("""
            CREATE TABLE IF NOT EXISTS emojiActivity (
            emoji TEXT,
            person TEXT,
            datetime TEXT 
            )
            """)
        db_conn.commit()
        db_cursor.close()
        print('Database created for', guild)
    except sqlite3.Error as error:
        print("Failed to create sqlite table", error)


def delete_from_db(context, str_emoji):
    """
    Deletes a list of emojis from database.
    """

    try:
        # Deletes record with found emoji, user who posted emoji, and time when emoji was posted.
        db_path = 'databases/' + str(context.guild.id) + '.sqlite'
        db_conn = sqlite3.connect(db_path)
        db_cursor = db_conn.cursor()
        db_cursor.execute("""
                    DELETE FROM emojiActivity
                    WHERE rowid = 
                    (
                        SELECT rowid
                        FROM emojiActivity
                        WHERE 
                            emoji = ? AND 
                            person = ? AND 
                            datetime = ?
                        LIMIT 1
                    )
                    """, (str_emoji, str(context.author.id), context.created_at.strftime('%Y-%m-%d')))
        print(f"Record has been removed: ({str_emoji}, "
              f"{str(context.author.id)}, "
              f"{context.created_at.strftime('%Y-%m-%d')})")
        db_conn.commit()
        db_cursor.close()
    except sqlite3.Error as error:
        print("Failed to delete record.", error)


def insert_to_db(context, str_emoji):
    """
    Inserts a list of emojis into database.
    """
    try:
        # Inserts new record with found emoji, user who posted emoji, and time when emoji was posted.
        db_path = 'databases/' + str(context.guild.id) + '.sqlite'
        db_conn = sqlite3.connect(db_path)
        db_cursor = db_conn.cursor()
        db_cursor.execute("""
                INSERT INTO emojiActivity(emoji, person, datetime)
                VALUES(?, ?, ?)
                """, (str_emoji, str(context.author.id), context.created_at.strftime('%Y-%m-%d')))
        db_conn.commit()
        db_cursor.close()
        print(f"Record has been inserted: ({str_emoji}, "
              f"{str(context.author.id)}, "
              f"{context.created_at.strftime('%Y-%m-%d')})")
    except sqlite3.Error as error:
        print("Failed to insert record", error)


def get_leaderboard(context, emoji):
    try:
        db_path = 'databases/' + str(context.guild.id) + '.sqlite'
        db_conn = sqlite3.connect(db_path)
        db_cursor = db_conn.cursor()
        db_cursor.execute(f"""
            SELECT 
                person,
                COUNT(emoji) 
            FROM 
                emojiActivity
            WHERE 
                emoji = '{emoji.id}'
                AND person IS NOT '757326308547100712'
            GROUP BY 
                person
            ORDER BY 
                COUNT(emoji) DESC
            LIMIT 10;
        """)
        rows = db_cursor.fetchall()
        db_conn.commit()
        db_cursor.close()
        return rows
    except sqlite3.Error as error:
        print(error)


def get_getcount_member_alltime(context, member):
    try:
        db_path = 'databases/' + str(context.guild.id) + '.sqlite'
        db_conn = sqlite3.connect(db_path)
        db_cursor = db_conn.cursor()
        db_cursor.execute(f"""
             SELECT 
                 COUNT(emoji) 
             FROM 
                 emojiActivity
             WHERE 
                 person = '{member}'
             """)
        count = db_cursor.fetchone()
        db_conn.commit()
        db_cursor.close()
        return count
    except sqlite3.Error as error:
        print(error)


def get_getcount_member_monthly(context, member):
    try:
        db_path = 'databases/' + str(context.guild.id) + '.sqlite'
        db_conn = sqlite3.connect(db_path)
        db_cursor = db_conn.cursor()
        db_cursor.execute(f"""
                     SELECT 
                         COUNT(emoji) 
                     FROM 
                         emojiActivity
                     WHERE
                         person = '{member}' AND
                         datetime > date('now', '-1 month')
                     """)
        count = db_cursor.fetchone()
        db_conn.commit()
        db_cursor.close()
        return count
    except sqlite3.Error as error:
        print(error)


def get_getcount_member_weekly(context, member):
    try:
        db_path = 'databases/' + str(context.guild.id) + '.sqlite'
        db_conn = sqlite3.connect(db_path)
        db_cursor = db_conn.cursor()
        db_cursor.execute(f"""
                     SELECT 
                         COUNT(emoji) 
                     FROM 
                         emojiActivity
                     WHERE
                         person = '{member}' AND
                         datetime > date('now', '-7 day')
                     """)
        count = db_cursor.fetchone()
        db_conn.commit()
        db_cursor.close()
        return count
    except sqlite3.Error as error:
        print(error)


def get_getcount_server_alltime(context):
    try:
        db_path = 'databases/' + str(context.guild.id) + '.sqlite'
        db_conn = sqlite3.connect(db_path)
        db_cursor = db_conn.cursor()
        db_cursor.execute(f"""
                     SELECT 
                         COUNT(emoji) 
                     FROM 
                         emojiActivity
                     """)
        count = db_cursor.fetchone()
        db_conn.commit()
        db_cursor.close()
        return count
    except sqlite3.Error as error:
        print(error)


def get_getcount_server_monthly(context):
    try:
        db_path = 'databases/' + str(context.guild.id) + '.sqlite'
        db_conn = sqlite3.connect(db_path)
        db_cursor = db_conn.cursor()
        db_cursor.execute(f"""
                             SELECT 
                                 COUNT(emoji) 
                             FROM 
                                 emojiActivity
                             WHERE
                                 datetime > date('now', '-1 month')
                             """)
        count = db_cursor.fetchone()
        db_conn.commit()
        db_cursor.close()
        return count
    except sqlite3.Error as error:
        print(error)


def get_getcount_server_weekly(context):
    try:
        db_path = 'databases/' + str(context.guild.id) + '.sqlite'
        db_conn = sqlite3.connect(db_path)
        db_cursor = db_conn.cursor()
        db_cursor.execute(f"""
                             SELECT 
                                 COUNT(emoji) 
                             FROM 
                                 emojiActivity
                             WHERE
                                 datetime > date('now', '-7 day')
                             """)
        count = db_cursor.fetchone()
        db_conn.commit()
        db_cursor.close()
        return count
    except sqlite3.Error as error:
        print(error)


def get_displaystats_member_all(context, member):
    """
    Queries db for specified user input, returns rows of query.
    """

    try:
        db_path = 'databases/' + str(context.guild.id) + '.sqlite'
        db_conn = sqlite3.connect(db_path)
        db_cursor = db_conn.cursor()
        db_cursor.execute(f"""
                 SELECT 
                     emoji,
                     COUNT(emoji) 
                 FROM 
                     emojiActivity
                 WHERE 
                     person = '{member}'
                 GROUP BY 
                     emoji
                 ORDER BY COUNT(emoji) DESC
                 """)
        rows = db_cursor.fetchall()
        db_conn.commit()
        db_cursor.close()
        return rows
    except sqlite3.Error as error:
        print(error)


def get_displaystats_member_monthly(context, member):
    """
    Queries db for specified user input, returns rows of query.
    """

    try:
        db_path = 'databases/' + str(context.guild.id) + '.sqlite'
        db_conn = sqlite3.connect(db_path)
        db_cursor = db_conn.cursor()
        db_cursor.execute(f"""
                         SELECT 
                             emoji,
                             COUNT(emoji) 
                         FROM 
                             emojiActivity
                         WHERE
                             person = '{member}' AND
                             datetime > date('now', '-1 month')
                         GROUP BY 
                             emoji        
                         ORDER BY COUNT(emoji) DESC
                         """)
        rows = db_cursor.fetchall()
        db_conn.commit()
        db_cursor.close()
        return rows
    except sqlite3.Error as error:
        print(error)


def get_displaystats_member_weekly(context, member):
    """
    Queries db for specified user input, returns rows of query.
    """

    try:
        db_path = 'databases/' + str(context.guild.id) + '.sqlite'
        db_conn = sqlite3.connect(db_path)
        db_cursor = db_conn.cursor()
        db_cursor.execute(f"""
                         SELECT 
                             emoji,
                             COUNT(emoji) 
                         FROM 
                             emojiActivity
                         WHERE
                             person = '{member}' AND
                             datetime > date('now', '-7 day')
                         GROUP BY 
                             emoji        
                         ORDER BY COUNT(emoji) DESC
                         """)
        rows = db_cursor.fetchall()
        db_conn.commit()
        db_cursor.close()
        return rows
    except sqlite3.Error as error:
        print(error)


def get_displaystats_server_all(context):
    """
    Queries db for specified user input, returns rows of query.
    """

    try:
        db_path = 'databases/' + str(context.guild.id) + '.sqlite'
        db_conn = sqlite3.connect(db_path)
        db_cursor = db_conn.cursor()
        db_cursor.execute("""
                 SELECT 
                     emoji,
                     COUNT(emoji) 
                 FROM 
                     emojiActivity
                 GROUP BY 
                     emoji        
                 ORDER BY COUNT(emoji) DESC
                 """)
        rows = db_cursor.fetchall()
        db_conn.commit()
        db_cursor.close()
        return rows
    except sqlite3.Error as error:
        print(error)


def get_displaystats_server_monthly(context):
    """
    Queries db for specified user input, returns rows of query.
    """

    try:
        db_path = 'databases/' + str(context.guild.id) + '.sqlite'
        db_conn = sqlite3.connect(db_path)
        db_cursor = db_conn.cursor()
        db_cursor.execute("""
                         SELECT 
                             emoji,
                             COUNT(emoji) 
                         FROM 
                             emojiActivity
                         WHERE
                             datetime > date('now', '-1 month')
                         GROUP BY 
                             emoji        
                         ORDER BY COUNT(emoji) DESC
                         """)
        rows = db_cursor.fetchall()
        db_conn.commit()
        db_cursor.close()
        return rows
    except sqlite3.Error as error:
        print(error)


def get_displaystats_server_weekly(context):
    """
    Queries db for specified user input, returns rows of query.
    """

    try:
        db_path = 'databases/' + str(context.guild.id) + '.sqlite'
        db_conn = sqlite3.connect(db_path)
        db_cursor = db_conn.cursor()
        db_cursor.execute("""
                         SELECT 
                             emoji,
                             COUNT(emoji) 
                         FROM 
                             emojiActivity
                         WHERE
                             datetime > date('now', '-7 day')
                         GROUP BY 
                             emoji        
                         ORDER BY COUNT(emoji) DESC
                         """)
        rows = db_cursor.fetchall()
        db_conn.commit()
        db_cursor.close()
        return rows
    except sqlite3.Error as error:
        print(error)
