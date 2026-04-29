/*
Note: I havent test all the Function, I just write it
      If u guys have started to use, tell me any error if found
*/


// databaseService.ts or any other file
import { db, CreateTable } from './CreateTable';
import { CLOUD_BASE_URL } from '../services/cloudService';

// Call this function to initialize tables
export const initializeDatabase = () => {
  CreateTable();
};

export const UpdateFolderName = (folderId: number, newName: string) => {
  console.log(`Attempting to update folder ${folderId} to: ${newName}`);

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE Folder SET folder_name = ?, updated_at = ? WHERE folder_id = ?',
        [newName, new Date().toISOString(), folderId],
        (_, result) => {
          // IMPORTANT: If rowsAffected is 0, the folder_id was wrong!
          console.log("Rows affected:", result.rowsAffected);

          if (result.rowsAffected === 0) {
            console.warn("No folder found with that ID. Check if folder_id is a string or number.");
          }
          resolve(result);
        },
        (_, error) => {
          console.error("SQL Execution Error:", error.message);
          reject(error);
          return false;
        }
      );
    }, (err) => {
      console.error("Transaction Error:", err.message);
    });
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
          console.log("UPDATE FOLDER ERROR:", error);
          reject(error);
          return false;
        }
      );
    });
  });
};

// Update Image
export const UpdateNoteImage = async (noteId: string | number, images: string[]) => {
  // 1. Save to Local SQLite (This makes it stay when you view the note again)
  const imagesString = JSON.stringify(images);
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE Note SET image_uri = ?, updated_at = ? WHERE note_id = ?',
        [imagesString, new Date().toISOString(), noteId],
        (_, results) => {
          console.log("Image URI updated in SQLite");
          resolve(results);
        },
        (_, error) => {
          console.error("SQL Update Error:", error);
          reject(error);
          return false;
        }
      );
    });

    // 2. Keep your Cloud update if you are using service.js
    fetch(`${CLOUD_BASE_URL}/notes/${noteId}/images`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images }),
    }).catch(err => console.log("Cloud sync failed:", err));
  });
};