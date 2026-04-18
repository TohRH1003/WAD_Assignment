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