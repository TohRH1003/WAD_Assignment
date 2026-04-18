/*
Note: I havent test all the Function, I just write it
      If u guys have started to use, tell me any error if found
*/

import {db, CreateTable} from './CreateTable';

export const initializeDatabase = () => {
  CreateTable();
};

const normalizeSqliteError = (error: any) => {
  const rawMessage = `${error?.message || ''} ${
    error?.code || ''
  }`.toLowerCase();

  if (
    rawMessage.includes('unique') &&
    (rawMessage.includes('user.username') || rawMessage.includes('username'))
  ) {
    return new Error('Username already exists');
  }

  if (
    rawMessage.includes('unique') &&
    (rawMessage.includes('user.email') || rawMessage.includes('email'))
  ) {
    return new Error('Email already exists');
  }

  if (rawMessage.includes('not null')) {
    return new Error('All fields are required');
  }

  if (error instanceof Error && error.message) {
    return error;
  }

  return new Error('Unable to create account right now');
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
          reject(normalizeSqliteError(error));
          return false;
        },
      );
    });
  });
};

export const InsertFolder = (
  folder_name: string,
  username: string,
  parent_folder_id: string | null = null,
) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO Folder (folder_name, created_at, updated_at, username, parent_folder_id, is_deleted, is_pinned)
         VALUES(?, ?, ?, ?, ?, 0, 0)`,
        [
          folder_name,
          new Date().toISOString(),
          new Date().toISOString(),
          username,
          parent_folder_id,
        ],
        (_, results) => {
          resolve({
            success: true,
            folderId: results.insertId,
            folderName: folder_name,
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
  folder_id: string | null,
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

export const InsertImage = (
  local_path: string,
  width: number,
  height: number,
  note_id: number,
) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO Image (local_path, width, height, note_id)
         VALUES(?, ?, ?, ?)`,
        [local_path, width, height, note_id],
        (_, results) => {
          resolve(results);
        },
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};
