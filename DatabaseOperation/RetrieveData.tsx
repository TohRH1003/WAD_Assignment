import {db, CreateTable} from './CreateTable';

export const initializeDatabase = () => {
  CreateTable();
};

export const ReadUserData = (username: string) => {
  return new Promise((resolve, reject) => {
    if (!username || username.trim() === '') {
      reject(new Error('Username is required'));
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM User WHERE username = ?',
        [username.trim()],
        (_, results) => {
          if (results.rows.length > 0) {
            resolve(results.rows.item(0));
            return;
          }

          reject(new Error(`User with username "${username}" not found`));
        },
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

export const ReadNoteData = (username: string) => {
  return new Promise((resolve, reject) => {
    if (!username || username.trim() === '') {
      reject(new Error('Username is required'));
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        `SELECT
          note_id,
          title,
          created_at,
          updated_at,
          is_pinned,
          is_deleted,
          folder_id
        FROM Note
        WHERE username = ? AND is_deleted = 0
        ORDER BY is_pinned DESC, updated_at DESC`,
        [username.trim()],
        (_, results) => {
          resolve(results.rows.raw());
        },
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

export const ReadNoteContent = (note_id: number) => {
  return new Promise((resolve, reject) => {
    if (!note_id) {
      reject(new Error('Note ID is required'));
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        'SELECT content, title, updated_at FROM Note WHERE note_id = ? AND is_deleted = 0',
        [note_id],
        (_, results) => {
          if (results.rows.length > 0) {
            const note = results.rows.item(0);
            resolve({
              content: note.content || '',
              title: note.title,
              updated_at: note.updated_at,
            });
            return;
          }

          reject(new Error(`Note with ID ${note_id} not found or is deleted`));
        },
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

export const ReadFolderData = (folder_id: number) => {
  return new Promise((resolve, reject) => {
    if (!folder_id) {
      reject(new Error('Folder ID is required'));
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Folder WHERE folder_id = ? AND is_deleted = 0',
        [folder_id],
        (_, results) => {
          if (results.rows.length > 0) {
            resolve(results.rows.item(0));
            return;
          }

          reject(
            new Error(`Folder with ID "${folder_id}" not found or is deleted`),
          );
        },
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};
