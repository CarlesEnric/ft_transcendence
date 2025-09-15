import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

export async function initializeDb()
{
  const db = await open({
    filename: process.env.DB_FILE || '/data/matches.db',
    driver: sqlite3.Database
  });
  await db.run('PRAGMA foreign_keys = ON;');
  await db.run('PRAGMA journal_mode = WAL;');
  await db.run('PRAGMA synchronous = NORMAL;');
  // Torneos
  await db.run(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      size INTEGER NOT NULL CHECK (size IN (4,8)) DEFAULT 4,
      status TEXT NOT NULL DEFAULT 'planned', -- planned | open | in_progress | finished | cancelled
      creator_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      started_at TEXT DEFAULT NULL,
      finished_at TEXT DEFAULT NULL,
      winner_id INTEGER DEFAULT NULL,
      winner_username TEXT DEFAULT NULL
    );
  `);
  await db.run(`
    CREATE TABLE IF NOT EXISTS tournament_participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      username TEXT NOT NULL,
      joined_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
      UNIQUE(tournament_id, user_id)
    );
  `);
  await db.run(`
    CREATE TABLE IF NOT EXISTS tournament_seeds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      seat INTEGER NOT NULL, -- 1..size
      user_id INTEGER NOT NULL,
      username TEXT NOT NULL,
      UNIQUE(tournament_id, seat),
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
    );
  `);
  await db.run(`
    CREATE TABLE IF NOT EXISTS tournament_matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      round INTEGER NOT NULL, -- 1..N
      slot INTEGER NOT NULL,  -- 1..(size/2^round)
      status TEXT NOT NULL DEFAULT 'pending', -- pending | finished
      -- Para R1, estos seats apuntan a tournament_seeds(seat):
      player1_seat INTEGER DEFAULT NULL,
      player2_seat INTEGER DEFAULT NULL,
      -- Enlaces con otros partidos (árbol):
      prev_p1_id INTEGER DEFAULT NULL, -- partido cuyo ganador ocupa p1 aquí
      prev_p2_id INTEGER DEFAULT NULL, -- partido cuyo ganador ocupa p2 aquí
      next_match_id INTEGER DEFAULT NULL, -- partido al que avanza el ganador
      next_is_p1 INTEGER DEFAULT NULL,    -- 1 si el ganador va a p1 del next, 0 si a p2
      -- Resultado final:
      score1 INTEGER DEFAULT NULL,
      score2 INTEGER DEFAULT NULL,
      winner_id INTEGER DEFAULT NULL,
      winner_username TEXT DEFAULT NULL,
      finished_at TEXT DEFAULT NULL,
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
    );
  `);
  // Matches
  await db.run(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player1 INTEGER NOT NULL,
      player2 INTEGER NOT NULL,
      username1 TEXT NOT NULL,
      username2 TEXT NOT NULL,
      score1 INTEGER NOT NULL,
      score2 INTEGER NOT NULL,
      winner INTEGER NOT NULL,
      date TEXT NOT NULL,
      tournament_id INTEGER NULL,
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE SET NULL
    );
  `);
  // Dashboard
  await db.run(`
    CREATE TABLE IF NOT EXISTS dashboard (
      userId INTEGER PRIMARY KEY,
      games_played INTEGER NOT NULL DEFAULT 0,
      games_won INTEGER NOT NULL DEFAULT 0,
      games_lost INTEGER NOT NULL DEFAULT 0
    );
  `);
  // Rooms
  await db.run(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      mode TEXT NOT NULL CHECK (mode IN ('ladder','tournament')),
      status TEXT NOT NULL DEFAULT 'waiting',
      tournament_id INTEGER NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      started_at TEXT DEFAULT NULL,
      finished_at TEXT DEFAULT NULL,
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE SET NULL
    );
  `);
  await db.run(`
    CREATE TABLE IF NOT EXISTS room_players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      username TEXT NOT NULL,
      ready INTEGER NOT NULL DEFAULT 0,
      joined_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(room_id, user_id),
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    );
  `);
  // Indexes
  await db.run(`CREATE INDEX IF NOT EXISTS idx_matches_user ON matches (player1, player2, date DESC);`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_matches_tournament ON matches (tournament_id, date DESC);`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_matches_player1 ON matches (player1);`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_matches_player2 ON matches (player2);`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_tournament_participants_t ON tournament_participants (tournament_id);`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_tournament_participants_u ON tournament_participants (user_id);`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_dashboard_wins ON dashboard (games_won DESC, games_played DESC);`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_room_code ON rooms (code);`);
  await db.run(`CREATE INDEX IF NOT EXISTS idx_room_players_room ON room_players (room_id);`);

  return db;
}