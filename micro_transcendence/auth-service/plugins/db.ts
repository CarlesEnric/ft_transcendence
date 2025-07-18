import { FastifyInstance } from 'fastify';
import sqlite3 from 'sqlite3';

declare module 'fastify' {
  interface FastifyInstance {
    db: any;
    initDb: () => void;
  }
}

// Posar mateixa ruta de volum perque persisteixi la base de dades (db/db.sqlite)
export const dbPlugin = async (fastify: FastifyInstance) => {
  fastify.decorate('db', new sqlite3.Database('db/db.sqlite', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err: any) => {
    if (err) {
      console.error('Error al connectar-se a la base de dades SQLite:', err);
    } else {
      console.log('Base de dades SQLite connectada correctament');
    }
  }));

  // Inicialitza la base de dades, creant taules si no existeixen
  fastify.decorate('initDb', () => {
    fastify.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        
      );
    `);
  });

  // Inicia la base de dades en iniciar el servidor
  fastify.initDb();
};