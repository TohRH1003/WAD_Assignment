import {db} from './CreateTable';

export type UserRecord = {
  username: string;
  password: string;
  name: string;
  email: string;
  create_at: string;
};

const validateCredentials = (username: string, password: string) => {
  const trimmedUsername = username.trim();

  if (!trimmedUsername || !password.trim()) {
    throw new Error('Username and password are required');
  }
};

export const loginUser = (username: string, password: string) => {
  return new Promise<UserRecord | null>((resolve, reject) => {
    try {
      validateCredentials(username, password);
    } catch (error) {
      reject(error);
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM User WHERE username = ? AND password = ?',
        [username.trim(), password],
        (_, {rows}) => {
          resolve(rows.length > 0 ? (rows.item(0) as UserRecord) : null);
        },
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

export const getUserByUsername = (username: string) => {
  return new Promise<UserRecord | null>((resolve, reject) => {
    if (!username.trim()) {
      reject(new Error('Username is required'));
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM User WHERE username = ?',
        [username.trim()],
        (_, {rows}) => {
          resolve(rows.length > 0 ? (rows.item(0) as UserRecord) : null);
        },
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};
