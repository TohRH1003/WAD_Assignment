import {Db, CreateTable} from './CreateTable';

export const initializeDatabase = () => {
  CreateTable();
};

//All the function havent test, if u guys find any error, please tell me


//Read user info
export const ReadUserData = (username: any) => {
  return new Promise((resolve, reject) => {
    Db.executeSql(
      'SELECT * From User where username = ?',
      [username],

      results => {
        const users = results.rows.raw();
        resolve(users);
      },
      error => {
        console.log('Error :', error);
        reject(error);
      },
    );
  });
};

//Read note for specific user, just metadata, no content of note
// If note is deleted, will no show
// Pinned note will aslo shows first
export const ReadNoteData = (username: string) => {
  return new Promise((resolve, reject) => {
    Db.executeSql(
      'SELECT note_id, title, created_at, updated_at, is_pinned, is_deleted, folder_id FROM Note WHERE username = ? AND is_deleted = 0 ORDER BY is_pinned DESC, updated_at DESC',
      [username],
      results => {
        const notes = results.rows.raw();
        resolve(notes);
      },
      error => {
        console.log('Error details:', error);
        console.log('Error message:', error?.message);
        console.log('Error code:', error?.code);
        reject(error);
      },
    );
  });
};

//Return only the content of note
export const ReadNoteContent = (note_id: any) => {
  return new Promise((resolve, reject) => {
    Db.executeSql(
      'SELECT content from Note where note_id = ?',
      [note_id],
      results => {
        const notes = results.rows.raw();
        resolve(notes);
      },
      error => {
        console.log('Error details:', error);
        console.log('Error message:', error?.message);
        console.log('Error code:', error?.code);
        reject(error);
      },
    );
  });
};
