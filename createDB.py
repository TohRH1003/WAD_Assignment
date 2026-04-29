import sqlite3
db = sqlite3.connect('noteTaking.sqlite')

db.execute('''CREATE TABLE IF NOT EXISTS students(
    id integer PRIMARY KEY AUTOINCREMENT,
    name text NOT NULL,
    email text NOT NULL,
    state text NOT NULL
)''')

db.execute('''CREATE TABLE IF NOT EXISTS Folder (
    folder_id INTEGER PRIMARY KEY AUTOINCREMENT,
    folder_name TEXT NOT NULL,
    username TEXT NOT NULL,
    is_deleted INTEGER DEFAULT 0
)''')

# Ensure Note table exists with folder_id
db.execute('''CREATE TABLE IF NOT EXISTS Note (
    note_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    folder_id INTEGER,
    is_pinned INTEGER DEFAULT 0,
    is_deleted INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    image_uri TEXT,
    FOREIGN KEY (folder_id) REFERENCES Folder (folder_id)
)''')

cursor = db.cursor()

# Only insert if the table was empty (to avoid duplicate data every time you run the script)
cursor.execute('SELECT count(*) FROM students')
if cursor.fetchone()[0] == 0:
    cursor.execute('''INSERT INTO students(name,email,state) VALUES("Chia Kim Hooi","chiakh@duckmail.com","07")''')
    cursor.execute('''INSERT INTO students(name,email,state) VALUES("Foo Yoke Wai","fooyw@roostermail.com","08")''')
    cursor.execute('''INSERT INTO students(name,email,state) VALUES("Ng Pei Li","ngpl@catmail.com","05")''')
    cursor.execute('''INSERT INTO students(name,email,state) VALUES("Lim Li Li","limll@koalamail.com","01")''')
    cursor.execute('''INSERT INTO students(name,email,state) VALUES("Mok Sook Chen","moksc@dogmail.com","07")''')
    print("Sample student data inserted.")

db.commit()
db.close()
print("Database 'noteTaking.sqlite' is ready and updated!")