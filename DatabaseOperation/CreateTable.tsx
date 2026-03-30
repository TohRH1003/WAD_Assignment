import SQLite from 'react-native-sqlite-storage';

const openCallBack = () => { //Display success message when database can open
  console.log('Database open successfully');
};

const errorCallBack = (error: any) => { //Display error message when database cannot be open
  console.log('Database cannot be open:' + error);
};

export const Db = SQLite.openDatabase(
  {
    name: 'noteTaking.sqlite',
    location: 'default',
  },
  openCallBack,
  errorCallBack,
);

export const CreateTable = () => { //Method used to create table in Sqlite
  Db.transaction(tx => {
    tx.executeSql( //Add User table
      `CREATE TABLE IF NOT EXISTS User (  
        username TEXT PRIMARY KEY,  
        password TEXT NOT NULL,   
        name TEXT NOT NULL,               
        email TEXT UNIQUE NOT NULL,
        create_at TEXT NOT NULL           
      )`,
      [],
      () => console.log('User table created'),
      error => console.log('Error:', error),
    );

    tx.executeSql( //Add Folder table
      `CREATE TABLE IF NOT EXISTS Folder (
        folder_id INTEGER PRIMARY KEY AUTOINCREMENT,
        folder_name TEXT NOT NULL,          
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        is_deleted INTEGER DEFAULT 0,
        is_pinned INTEGER DEFAULT 0,
        username TEXT,
        parent_folder_id TEXT, 
        FOREIGN KEY (username) REFERENCES User(username) ON DELETE CASCADE,
        FOREIGN KEY (parent_folder_id) REFERENCES Folder(folder_id) ON DELETE CASCADE
        )`,
      [],
      () => console.log('Folder table created'),
      error => console.log('Error:', error),
    );

    tx.executeSql(  //Add Note table
      `CREATE TABLE IF NOT EXISTS Note (
        note_id INTEGER PRIMARY KEY AUTOINCREMENT, 
        title TEXT NOT NULL,
        content TEXT,                         
        created_at TEXT NOT NULL,                      
        updated_at TEXT NOT NULL,                      
        is_pinned INTEGER DEFAULT 0,                      
        is_deleted INTEGER DEFAULT 0,                  
        username TEXT,
        folder_id TEXT,
        FOREIGN KEY (username) REFERENCES User(username) ON DELETE CASCADE,
        FOREIGN KEY (folder_id) REFERENCES Folder(folder_id) ON DELETE SET NULL
        )`,
      [],
      () => console.log('Note table created'),
      error => console.log('Error:', error),
    );

    tx.executeSql( //Add Image table
      `CREATE TABLE IF NOT EXISTS Image (
        image_id INTEGER PRIMARY KEY AUTOINCREMENT, 
        local_path TEXT NOT NULL,               
        width INTEGER,
        height INTEGER,
        note_id TEXT,
        FOREIGN KEY (note_id) REFERENCES Note(note_id) ON DELETE CASCADE 
        )`,
      [],
      () => console.log('Image table created'),
      error => console.log('Error:', error),
    );
  });
};
