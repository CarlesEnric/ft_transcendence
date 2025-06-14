import { FastifyInstance } from 'fastify';
import betterSqlite3 from 'better-sqlite3';

export const dbPlugin = async (fastify: FastifyInstance) => {
  // Crea la connexió a la base de dades (sincrònic)
  const db = betterSqlite3('/app/db/db.sqlite');

  // Decora Fastify amb la instància de la DB
  fastify.decorate('db', db);

  // Funció per inicialitzar la DB
  fastify.decorate('initDb', () => {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE
      );
    `).run();
  });

  // Inicialitza la DB
  fastify.initDb();
};