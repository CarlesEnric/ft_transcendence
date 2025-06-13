import { FastifyInstance } from 'fastify';
import sqlite3 from 'sqlite3';

export const dbPlugin = async (fastify: FastifyInstance) => {
  fastify.decorate('db', new sqlite3.Database('/app/db/db.sqlite', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.error('Error connecting to SQLite:', err);
    } else {
      console.log('SQLite DB connected');
    }
  }));

  fastify.decorate('initDb', () => {
    fastify.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE
      );
    `);
  });

  fastify.initDb();
};