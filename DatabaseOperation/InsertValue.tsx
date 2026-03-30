/*
Note: I havent test all the Function, I just write it
      If u guys have started to use, tell me any error if found
*/


// databaseService.ts or any other file
import {Db, CreateTable} from './CreateTable';

// Call this function to initialize tables
export const initializeDatabase = () => {
  CreateTable();
};

// Function to insert User 
// Tested, can function properly
export const InsertUser = (
  username: string,
  password: string,
  name: string,
  email: string,
) => {
  Db.transaction(tx => {
    tx.executeSql(
      `INSERT INTO User (username, password, name, email, create_at)   
       VALUES(?, ?, ?, ?, ?)`,
      [username, password, name, email, new Date().toISOString()],
      (_, results) => {
        console.log('User inserted successfully with insertID: ', results);
      },
      (_, error) => {
        console.log('Insert error details:', error); // Log full error
        console.log('Error message:', error?.message); // Log error message
        console.log('Error code:', error?.code); // Log error code
      },
    );
  });
};

//Function to insert Folder, no folder_id because it is auto generated
// No is_deleted and is_pinned, both will set to 0 when create
// No created_at and updated_at, both will set to current time
export const InsertFolder = (
  folder_name: string,
  username: string,
  parent_folder_id: string | null,
) => {
  Db.transaction(tx => {
    tx.executeSql(
      `INSERT INTO Folder (folder_name, created_at, updated_at, username, parent_folder_id)   
       VALUES(?, ?, ?, ?, ?)`,
      [
        folder_name,
        new Date().toISOString(),
        new Date().toISOString(),
        username,
        parent_folder_id,
      ],
      (_, results) => {
        console.log('Folder inserted successfully with insertID: ', results);
      },
      (_, error) => {
        console.log('Insert error details:', error);
        console.log('Error message:', error?.message);
        console.log('Error code:', error?.code);
      },
    );
  });
};

//Function to insert Note, no note_id because it is auto generated
//No is_pinned and is_deleted, both will set to default 0 when created
// No created_at and updated_at, both will set to current time
// Content will be set to "" when created
export const InsertNote = (
  title: string,
  username: string,
  folder_id: string | null,
) => {
  Db.transaction(tx => {
    tx.executeSql(
      `INSERT INTO Note (title, content, created_at, updated_at, username, folder_id)   
       VALUES(?, ?, ?, ?, ?, ?)`,
      [
        title,
        '',
        new Date().toISOString(),
        new Date().toISOString(),
        username,
        folder_id,
      ],
      (_, results) => {
        console.log('Note inserted successfully with insertID: ', results);
      },
      (_, error) => {
        console.log('Insert error details:', error);
        console.log('Error message:', error?.message);
        console.log('Error code:', error?.code);
      },
    );
  });
};

//Function to insert Image, no image_id because it is auto generated
export const InsertImage = (
  local_path: string,
  width: number,
  height: number,
  note_id: string,
) => {
  Db.transaction(tx => {
    tx.executeSql(
      `INSERT INTO Image (local_path, width, height, note_id)   
       VALUES(?, ?, ?, ?)`,
      [local_path, width, height, note_id],
      (_, results) => {
        console.log('Image inserted successfully with insertID: ', results);
      },
      (_, error) => {
        console.log('Insert error details:', error);
        console.log('Error message:', error?.message);
        console.log('Error code:', error?.code);
      },
    );
  });
};