/**
 * Database utility functions
 */

import sqlite3 from 'sqlite3';



export function findUserByUsername(db: sqlite3.Database, username: string): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function findUserByEmail(db: sqlite3.Database, email: string): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function initializeDatabase(db: sqlite3.Database): void {
  db.serialize(() => {

    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,           -- nullable per OAuth
        provider TEXT,                -- nullable per usuaris ordinaris
        provider_id TEXT,             -- nullable per usuaris ordinaris
        firstName TEXT,              -- nom
        lastName TEXT,               -- cognoms
        display_name TEXT,            -- nom complet (per compatibilitat)
        avatar_url TEXT,
        two_factor_enabled BOOLEAN DEFAULT 0,
        two_factor_secret TEXT,       -- TOTP secret key
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
  });
}

/**
 * OAuth-specific database functions
 */


// OAuth: cerca per provider i provider_id
export function getUserByOAuth(db: sqlite3.Database, provider: string, provider_id: string): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE provider = ? AND provider_id = ?', [provider, provider_id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function createOAuthUser(db: sqlite3.Database, userData: {
  provider: string;
  provider_id: string;
  username: string;
  lastName: string;
  firstName: string;
  email: string;
  display_name: string;
  avatar_url?: string;
}): Promise<any> {
  return new Promise((resolve, reject) => {
    const { provider, provider_id, username, firstName, lastName, email, display_name, avatar_url } = userData;
    db.run(`
      INSERT INTO users (provider, provider_id, username, firstName, lastName, email, display_name, avatar_url) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [provider, provider_id, username, firstName, lastName, email, display_name, avatar_url || null], function(this: sqlite3.RunResult, err) {
      if (err) {
        reject(err);
      } else {
        db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      }
    });
  });
}

export function updateUserAvatar(db: sqlite3.Database, userId: number, avatarUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(`
      UPDATE users 
      SET avatar_url = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [avatarUrl, userId], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * Create user with OAuth data (accepts object parameter)
 */

export function createUserInDB(db: sqlite3.Database, userData: {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password_hash?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
}): Promise<any> {
  return new Promise((resolve, reject) => {
    const {
      username,
      firstName,
      lastName,
      email,
      password_hash,
      display_name,
      avatar_url
    } = userData;

    db.run(`
      INSERT INTO users (username, firstName, lastName, email, password_hash, display_name, avatar_url) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [username, firstName, lastName, email, password_hash || null, display_name || null, avatar_url || null], function(this: sqlite3.RunResult, err) {
      if (err) {
        reject(err);
      } else {
        db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      }
    });
  });
}

/**
 * 2FA-specific database functions
 */

// Enable 2FA for a user
export function enable2FA(db: sqlite3.Database, userId: number, secret: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE users SET two_factor_enabled = 1, two_factor_secret = ? WHERE id = ?',
      [secret, userId],
      function(err) {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

// Disable 2FA for a user
export function disable2FA(db: sqlite3.Database, userId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE users SET two_factor_enabled = 0, two_factor_secret = NULL WHERE id = ?',
      [userId],
      function(err) {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

// Get 2FA settings for a user
export function get2FASettings(db: sqlite3.Database, userId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT two_factor_enabled, two_factor_secret FROM users WHERE id = ?',
      [userId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
}
