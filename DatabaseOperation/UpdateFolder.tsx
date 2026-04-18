/*
Note: I havent test all the Function, I just write it
      If u guys have started to use, tell me any error if found
*/


// databaseService.ts or any other file
import {db, CreateTable} from './CreateTable';

// Call this function to initialize tables
export const initializeDatabase = () => {
  CreateTable();
};

export const UpdateFolderName = (folder_id: number, folder_name: string) => {
  return new Promise((resolve, reject) => {
    // Validation
    if (!folder_id) {
      reject(new Error('Folder ID is required'));
      return;
    }

    if (!folder_name || folder_name.trim() === '') {
      reject(new Error('Folder name is required'));
      return;
    }

    const currentTime = new Date().toISOString();

    db.transaction(tx => {
      tx.executeSql(
        `UPDATE Folder 
         SET folder_name = ?, 
             updated_at = ? 
         WHERE folder_id = ? AND is_deleted = 0`,
        [folder_name.trim(), currentTime, folder_id],
        (_, results) => {
          if (results.rowsAffected > 0) {
            console.log(
              'Folder name updated successfully. Rows affected:',
              results.rowsAffected,
            );
            resolve({
              success: true,
              folder_id: folder_id,
              folder_name: folder_name,
              updated_at: currentTime,
              rowsAffected: results.rowsAffected,
            });
          } else {
            reject(
              new Error(
                `Folder with ID "${folder_id}" not found or is deleted`,
              ),
            );
          }
        },
        (_, error) => {
          console.log('Update error:', error);
          reject(error);
        },
      );
    });
  });
};