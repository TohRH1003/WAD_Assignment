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
    const query = trimmedPassword
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
