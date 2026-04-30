import { db, CreateTable } from './CreateTable';


// export const ReadNoteData = (username: string) => {
//   return new Promise((resolve, reject) => {
//     if (!username || username.trim() === '') {
//       reject(new Error('Username is required'));
//       return;
//     }

//     db.transaction(tx => {
//       tx.executeSql(
//         `SELECT
//           note_id,
//           title,
//           created_at,
//           updated_at,
//           is_pinned,
//           is_deleted,
//           folder_id
//         FROM Note
//         WHERE username = ? AND is_deleted = 0
//         ORDER BY is_pinned DESC, updated_at DESC`,
//         [username.trim()],
//         (_, results) => {
//           resolve(results.rows.raw());
//         },
//         (_, error) => {
//           reject(error);
//           return false;
//         },
//       );
//     });
//   });
// };

// Add this to your ../DatabaseOperation/RetrieveData.ts
export const ReadNoteData = (username: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT n.*, f.folder_name 
        FROM Note n 
        LEFT JOIN Folder f ON n.folder_id = f.folder_id 
        WHERE n.username = ? AND n.is_deleted = 0;`,
        [username],
        (_, { rows }) => {
          // Convert the SQL rows into a standard JavaScript array
          const notes = [];
          for (let i = 0; i < rows.length; i++) {
            notes.push(rows.item(i));
          }
          console.log("DEBUG: Fresh data from DB:", notes[0]?.folder_name); // Check this log!
          resolve(notes);
        },
        (_, error) => {
          console.error("ReadNoteData Error: ", error);
          reject(error);
          return false;
        }
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
        // 'SELECT content, title, updated_at FROM Note WHERE note_id = ? AND is_deleted = 0',
        `SELECT n.content, n.title, n.updated_at, n.folder_id, n.image_uri, f.folder_name 
         FROM Note n 
         LEFT JOIN Folder f ON n.folder_id = f.folder_id 
         WHERE n.note_id = ? AND n.is_deleted = 0`,
        [note_id],
        (_, results) => {
          if (results.rows.length > 0) {
            let note = results.rows.item(0);

            // Convert the string back into an array for the React Native state
            try {
              note.images = note.image_uri ? JSON.parse(note.image_uri) : [];
            } catch (e) {
              note.images = [];
            }

            resolve(note);
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

export const ReadNotesByFolder = (username: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT note_id, title, folder_id FROM Note 
         WHERE username = ? AND is_deleted = 0`,
        [username],
        (_, results) => {
          let temp = [];
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i));
          }
          resolve(temp);
        },
        (_, error) => reject(error)
      );
    });
  });
};

// 1. Fetch all active folders for the logged-in user
export const ReadUserFolders = (username: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    if (!username) {
      reject(new Error('Username is required'));
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        'SELECT folder_id, folder_name FROM Folder WHERE username = ? AND is_deleted = 0',
        [username.trim()],
        (_, { rows }) => {
          // FIX: Instead of .raw(), manually build the array
          const folders = [];
          for (let i = 0; i < rows.length; i++) {
            folders.push(rows.item(i));
          }
          resolve(folders);
        },
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

// 2. Add a new folder tied to a specific username
export const CreateNewFolder = (username: string, folderName: string) => {
  const now = new Date().toISOString();
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO Folder (folder_name, username, created_at, updated_at, is_deleted) VALUES (?, ?, ?, ?, 0)',
        [folderName, username, now, now],
        (_, result) => resolve(result),
        (_, error) => {
          console.log("INSERT ERROR:", error.message);
          reject(error);
          return false;
        }
      );
    });
  });
};

// 3. Soft delete a folder
export const SoftDeleteFolder = (folderId: number) => {
  const now = new Date().toISOString();
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE Note SET folder_id = NULL, updated_at = ? WHERE folder_id = ? AND is_deleted = 0',
        [now, folderId],
        () => {
          tx.executeSql(
            'UPDATE Folder SET is_deleted = 1, updated_at = ? WHERE folder_id = ?',
            [now, folderId],
            (_, result) => {
              if (result.rowsAffected > 0) {
                resolve(result);
              } else {
                reject(new Error('Folder not found.'));
              }
            },
            (_, error) => {
              reject(error);
              return false;
            },
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


export const SoftDeleteNote = (noteId: number) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE Note
         SET is_deleted = 1, updated_at = ?
         WHERE note_id = ?`,
        [new Date().toISOString(), noteId],
        (_, result) => {
          console.log('Soft delete rows affected:', result.rowsAffected);

          if (result.rowsAffected > 0) {
            resolve(result);
          } else {
            reject(new Error('No note found with this note_id.'));
          }
        },
        (_, error) => {
          console.log('SoftDeleteNote SQL error:', error.message);
          reject(error);
          return false;
        },
      );
    });
  });
};
