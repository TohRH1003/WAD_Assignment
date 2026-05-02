/*
Note: I havent test all the Function, I just write it
      If u guys have started to use, tell me any error if found
*/

import {db, CreateTable} from './CreateTable';

export const initializeDatabase = () => {
  CreateTable();
};

export const InsertUser = (
  username: string,
  password: string,
  name: string,
  email: string,
) => {
  return new Promise((resolve, reject) => {
    const trimmedUsername = username.trim();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername || !password.trim() || !trimmedName || !trimmedEmail) {
      reject(new Error('All fields are required'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      reject(new Error('Invalid email format'));
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO User (username, password, name, email, create_at)
         VALUES(?, ?, ?, ?, ?)`,
        [
          trimmedUsername,
          password,
          trimmedName,
          trimmedEmail,
          new Date().toISOString(),
        ],
        (_, results) => {
          resolve({
            success: true,
            username: trimmedUsername,
            rowsAffected: results.rowsAffected,
          });
        },
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};


export const InsertNote = (
  title: string,
  username: string,
  folder_id: string | null | number,
) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO Note (title, content, created_at, updated_at, username, folder_id, is_deleted, is_pinned)
         VALUES(?, ?, ?, ?, ?, ?, 0, 0)`,
        [
          title,
          '',
          new Date().toISOString(),
          new Date().toISOString(),
          username,
          folder_id || null,
        ],
        (_, results) => {
          resolve({
            success: true,
            noteId: results.insertId,
            rowsAffected: results.rowsAffected,
          });
        },
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

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

export const UpdateFolderName = (folderId: number, newName: string) => {
  console.log(`Attempting to update folder ${folderId} to: ${newName}`);

  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'UPDATE Folder SET folder_name = ?, updated_at = ? WHERE folder_id = ?',
          [newName, new Date().toISOString(), folderId],
          (_, result) => {
            // IMPORTANT: If rowsAffected is 0, the folder_id was wrong!
            console.log('Rows affected:', result.rowsAffected);

            if (result.rowsAffected === 0) {
              console.warn(
                'No folder found with that ID. Check if folder_id is a string or number.',
              );
            }
            resolve(result);
          },
          (_, error) => {
            console.error('SQL Execution Error:', error.message);
            reject(error);
            return false;
          },
        );
      },
      err => {
        console.error('Transaction Error:', err.message);
      },
    );
  });
};

export const UpdateNoteFolder = (noteId: number, folderId: number | null) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE Note SET folder_id = ?, updated_at = ? WHERE note_id = ?',
        [folderId, new Date().toISOString(), noteId],
        (_, results) => resolve(results),
        (_, error) => {
          console.log('UPDATE FOLDER ERROR:', error);
          reject(error);
          return false;
        },
      );
    });
  });
};

// Update Image
export const UpdateNoteImage = async (
  noteId: string | number,
  images: string[],
) => {
  // Save to Local SQLite (This makes it stay when you view the note again)
  const imagesString = JSON.stringify(images);
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE Note SET image_uri = ?, updated_at = ? WHERE note_id = ?',
        [imagesString, new Date().toISOString(), noteId],
        (_, results) => {
          console.log('Image URI updated in SQLite');
          resolve(results);
        },
        (_, error) => {
          console.error('SQL Update Error:', error);
          reject(error);
          return false;
        },
      );
    });
  });
};

//Function to update note content only
export const UpdateNoteContent = (note_id: number, content: any) => {
  return new Promise((resolve, reject) => {
    // ← Add this wrapper
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE Note
         SET content = ?,
             updated_at = ?  
         WHERE note_id = ?`,
        [content, new Date().toISOString(), note_id],
        (_, results) => {
          console.log(
            'Content updated successfully. Rows affected:',
            results.rowsAffected,
          );
          resolve(results); // ← Add resolve
        },
        (_, error) => {
          console.log('Update error details:', error);
          console.log('Error message:', error?.message);
          console.log('Error code:', error?.code);
          reject(error); // ← Add reject
        },
      );
    });
  });
};

export const UpdateNotePinStatus = (noteId: number, isPinned: number) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE Note
         SET is_pinned = ?, updated_at = ?
         WHERE note_id = ?`,
        [isPinned, new Date().toISOString(), noteId],
        (_, result) => {
          console.log('Pin update rows affected:', result.rowsAffected);

          if (result.rowsAffected > 0) {
            resolve(result);
          } else {
            reject(new Error('No note found with this note_id.'));
          }
        },
        (_, error) => {
          console.log('UpdateNotePinStatus SQL error:', error.message);
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

export const normalizeSqliteError = (error: any) => {
  const rawMessage = `${error?.message || ''} ${
    error?.code || ''
  }`.toLowerCase();

  if (
    rawMessage.includes('unique') &&
    (rawMessage.includes('user.email') || rawMessage.includes('email'))
  ) {
    return new Error('Email already exists');
  }

  if (error instanceof Error && error.message) {
    return error;
  }

  return new Error('Unable to update profile right now');
};

export const UpdateUserInfo = (
  username: string,
  password: string | null,
  name: string,
  email: string,
) => {
  return new Promise((resolve, reject) => {
    const trimmedUsername = username.trim();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername) {
      reject(new Error('Username is required'));
      return;
    }

    if (!trimmedName) {
      reject(new Error('Name is required'));
      return;
    }

    if (!trimmedEmail) {
      reject(new Error('Email is required'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      reject(new Error('Invalid email format'));
      return;
    }

    const trimmedPassword = password?.trim();
    const query = trimmedPassword //Check whether password is provided, if yes, update password as well, otherwise only update name and email
      ? `UPDATE User
         SET password = ?, name = ?, email = ?
         WHERE username = ?`
      : `UPDATE User
         SET name = ?, email = ?
         WHERE username = ?`;
    const params = trimmedPassword
      ? [trimmedPassword, trimmedName, trimmedEmail, trimmedUsername]
      : [trimmedName, trimmedEmail, trimmedUsername];

    db.transaction(tx => {
      tx.executeSql(
        query,
        params,
        (_, results) => {
          if (results.rowsAffected > 0) {
            resolve({
              success: true,
              username: trimmedUsername,
              name: trimmedName,
              email: trimmedEmail,
              rowsAffected: results.rowsAffected,
            });
            return;
          }

          reject(
            new Error(`User with username "${trimmedUsername}" not found`),
          );
        },
        (_, error) => {
          reject(normalizeSqliteError(error));
          return false;
        },
      );
    });
  });
};


