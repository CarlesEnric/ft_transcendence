import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

export async function initializeDb() {
  const db = await open({ filename: process.env.DB_FILE || './matches.db', driver: sqlite3.Database });
  await db.run(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player1 TEXT NOT NULL,
      player2 TEXT NOT NULL,
      score1 INTEGER NOT NULL,
      score2 INTEGER NOT NULL,
      winner TEXT NOT NULL,
      date TEXT NOT NULL
    )
  `);
  await db.run(`
    CREATE TABLE IF NOT EXISTS dashboard (
      userId TEXT PRIMARY KEY,
      games_played INTEGER NOT NULL DEFAULT 0,
      games_won INTEGER NOT NULL DEFAULT 0,
      games_lost INTEGER NOT NULL DEFAULT 0
    )
  `);
  return db;
}
