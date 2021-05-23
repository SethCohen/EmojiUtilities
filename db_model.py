import sqlite3


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
                emoji = '{emoji}'
                AND person IS NOT 'Emoji Statistics#2293'
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
