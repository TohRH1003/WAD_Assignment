/*
Note: I havent test all the Function, I just write it
      If u guys have started to use, tell me any error if found
*/

import {db, CreateTable} from './CreateTable';
import { normalizeSqliteError } from './UpdateUser';

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
