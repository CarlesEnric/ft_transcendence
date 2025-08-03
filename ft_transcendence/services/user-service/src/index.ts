import fastify from 'fastify';
import { readFileSync } from 'fs';
import 'dotenv/config';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

const server = fastify({
  logger: { level: 'info' },
  https: {
    key: readFileSync('/app/ssl/key.pem'),
    cert: readFileSync('/app/ssl/cert.pem')
  }
});

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set');
}
server.register(fastifyJwt, { secret: process.env.JWT_SECRET });
server.register(fastifyCookie);

// --- SQLite DB connection (shared with auth-service) ---
let db: Database<sqlite3.Database, sqlite3.Statement>;
const dbPath = process.env.AUTH_DB_PATH || '/app/db/auth.sqlite';

// --- JWT authentication middleware ---
server.addHook('onRequest', async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
});

// --- CRUD routes ---
// Create user
server.post('/users', async (request, reply) => {
  const { username, email } = request.body as { username?: string; email?: string };
  if (!username || !email) {
    return reply.status(400).send({ error: 'username and email required' });
  }
  try {
    const result = await db.run('INSERT INTO users (username, email) VALUES (?, ?)', username, email);
    const user = await db.get('SELECT id, username, email FROM users WHERE id = ?', result.lastID);
    reply.status(201).send(user);
  } catch (err) {
    reply.status(500).send({ error: 'DB error', details: err });
  }
});

// Get user by id
server.get('/users/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  try {
    const user = await db.get('SELECT id, username, email FROM users WHERE id = ?', id);
    if (!user) return reply.status(404).send({ error: 'User not found' });
    reply.send(user);
  } catch (err) {
    reply.status(500).send({ error: 'DB error', details: err });
  }
});

// Update user
server.put('/users/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const { username, email } = request.body as { username?: string; email?: string };
  try {
    const user = await db.get('SELECT id FROM users WHERE id = ?', id);
    if (!user) return reply.status(404).send({ error: 'User not found' });
    await db.run('UPDATE users SET username = COALESCE(?, username), email = COALESCE(?, email) WHERE id = ?', username, email, id);
    const updated = await db.get('SELECT id, username, email FROM users WHERE id = ?', id);
    reply.send(updated);
  } catch (err) {
    reply.status(500).send({ error: 'DB error', details: err });
  }
});

// Delete user
server.delete('/users/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  try {
    const user = await db.get('SELECT id FROM users WHERE id = ?', id);
    if (!user) return reply.status(404).send({ error: 'User not found' });
    await db.run('DELETE FROM users WHERE id = ?', id);
    reply.status(204).send();
  } catch (err) {
    reply.status(500).send({ error: 'DB error', details: err });
  }
});

// List users
server.get('/users', async (_request, reply) => {
  try {
    const users = await db.all('SELECT id, username, email FROM users');
    reply.send(users);
  } catch (err) {
    reply.status(500).send({ error: 'DB error', details: err });
  }
});

// Health check endpoint (no auth required)
server.get('/health', async (_request, reply) => {
  reply.send({ status: 'ok', service: 'user-service' });
});

const start = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    // Crea la taula si no existeix (només per a desenvolupament)
    await db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, email TEXT)');
    await server.listen({ port: 443, host: '0.0.0.0' });
    server.log.info('User service started on https://0.0.0.0:443');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
