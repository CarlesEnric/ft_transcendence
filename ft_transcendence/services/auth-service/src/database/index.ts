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
        password_hash TEXT,
        google_id TEXT UNIQUE,
        profile_picture TEXT,
        is_verified BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS oauth_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        google_id TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        avatar_url TEXT,
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

export function getUserByGoogleId(db: sqlite3.Database, googleId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM oauth_users WHERE google_id = ?', [googleId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function createOAuthUser(db: sqlite3.Database, userData: {
  google_id: string;
  username: string;
  email: string;
  display_name: string;
  avatar_url?: string;
}): Promise<any> {
  return new Promise((resolve, reject) => {
    const { google_id, username, email, display_name, avatar_url } = userData;
    
    db.run(`
      INSERT INTO oauth_users (google_id, username, email, display_name, avatar_url) 
      VALUES (?, ?, ?, ?, ?)
    `, [google_id, username, email, display_name, avatar_url || null], function(this: sqlite3.RunResult, err) {
      if (err) {
        reject(err);
      } else {
        // Return the created user
        db.get('SELECT * FROM oauth_users WHERE id = ?', [this.lastID], (err, row) => {
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
      UPDATE oauth_users 
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
  email: string;
  google_id?: string;
  profile_picture?: string | null;
  is_verified?: boolean;
  password_hash?: string | null;
}): Promise<any> {
  return new Promise((resolve, reject) => {
    const {
      username,
      email,
      google_id,
      profile_picture,
      is_verified,
      password_hash
    } = userData;

    db.run(`
      INSERT INTO users (username, email, google_id, profile_picture, is_verified, password_hash) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [username, email, google_id || null, profile_picture || null, is_verified || false, password_hash || null], function(err) {
      if (err) {
        reject(err);
      } else {
        // Return the created user
        db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      }
    });
  });
}
