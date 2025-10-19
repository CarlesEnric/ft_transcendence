import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { readFileSync } from 'fs';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import fastifyStatic from '@fastify/static';
import sqlite3 from 'sqlite3'; 
import { setupAvatarRoutes } from './routes/avatar.js';
import { fastifyMultipart } from '@fastify/multipart';


// Ensure /app/uploads exists and is writable
const uploadsDir = path.join('/app', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
try {
  fs.accessSync(uploadsDir, fs.constants.W_OK);
} catch (err) {
  console.error('Uploads directory is not writable:', uploadsDir);
  process.exit(1);
}

const server = fastify({
  logger: { level: 'info' },
  https: {
    key: readFileSync('/app/ssl/key.pem'),
    cert: readFileSync('/app/ssl/cert.pem')
  }
});


// Register cookie support for JWT in cookies (must be FIRST)
await server.register(fastifyCookie);

// Register JWT authentication with the same secret as auth-service (must be AFTER cookie)
await server.register(fastifyJwt, {
  secret: (process.env.JWT_SECRET as string) || 'your-secret-key',
  sign: { expiresIn: (process.env.JWT_EXPIRES_IN as string) || '24h' }
});

await server.register(fastifyMultipart);

// Serve /uploads as static files (avatars)
await server.register(fastifyStatic, {
  root: path.join('/app', 'uploads'),
  prefix: '/uploads/',
  decorateReply: false
});

// Decorate request with 'authenticate' method

// Global authentication hook: require JWT for all routes
server.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
  // Skip JWT verification for health endpoint
  if (request.url === '/health') {
    return;
  }
  // Extra debug: log cookies and jwt cookie value
  server.log.info({ cookies: request.cookies, jwtCookie: request.cookies?.jwt, headers: request.headers, url: request.url }, 'JWT debug');
  // Accept JWT from cookie (jwt) or Authorization header
  let token = request.cookies?.jwt || '';
  if (!token && request.headers.authorization) {
    const auth = request.headers.authorization;
    if (auth.startsWith('Bearer ')) token = auth.substring(7);
    else token = auth;
  }
  if (!token) {
    server.log.warn({ cookies: request.cookies, headers: request.headers }, 'No JWT token found in cookie or Authorization header');
    return reply.status(401).send({ error: 'Unauthorized' });
  }
  try {
    // Fastify-jwt expects the token in Authorization header, so set it if needed
    if (!request.headers.authorization) {
      request.headers.authorization = 'Bearer ' + token;
    }
    await request.jwtVerify();
  } catch (err) {
    server.log.error({ err, cookies: request.cookies, headers: request.headers }, 'JWT verification failed');
    return reply.status(401).send({ error: 'Unauthorized' });
  }
});

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set');
}

// --- SQLite DB connection (shared with auth-service) ---
let db: sqlite3.Database;
const dbPath: string = (process.env.AUTH_DB_PATH as string) || '/app/database/auth.db';



// --- CRUD routes ---
// Create user
server.post('/users', async (request: FastifyRequest, reply: FastifyReply) => {
  const { username, email } = request.body as { username?: string; email?: string };
  if (!username || !email) {
    return reply.status(400).send({ error: 'username and email required' });
  }
  try {
    const userId: number = await new Promise((resolve, reject) => {
      db.run('INSERT INTO users (username, email) VALUES (?, ?)', [username, email], function (err) {
        if (err) return reject(err);
        resolve(this.lastID);
      });
    });
    const user = await new Promise<any>((resolve, reject) => {
      db.get('SELECT id, username, email, avatar_url, firstName, lastName, display_name FROM users WHERE id = ?', [userId], function (err, user) {
        if (err) return reject(err);
        resolve(user);
      });
    });
    reply.status(201).send(user);
  } catch (err) {
    reply.status(500).send({ error: 'DB error', details: err });
  }
});

// Get user by id
server.get('/users/:id', async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  try {
    const user = await new Promise<any>((resolve, reject) => {
      db.get('SELECT id, username, email, avatar_url, firstName, lastName, display_name FROM users WHERE id = ?', [id], function (err, user) {
        if (err) return reject(err);
        resolve(user);
      });
    });
    if (!user) return reply.status(404).send({ error: 'User not found' });
    reply.send(user);
  } catch (err) {
    reply.status(500).send({ error: 'DB error', details: err });
  }
});

// Update user
server.put('/users/:id', async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const { username, email } = request.body as { username?: string; email?: string };
  try {
    const user = await new Promise<any>((resolve, reject) => {
      db.get('SELECT id FROM users WHERE id = ?', [id], function (err, user) {
        if (err) return reject(err);
        resolve(user);
      });
    });
    if (!user) return reply.status(404).send({ error: 'User not found' });
    await new Promise<void>((resolve, reject) => {
      db.run('UPDATE users SET username = COALESCE(?, username), email = COALESCE(?, email) WHERE id = ?', [username, email, id], function (err) {
        if (err) return reject(err);
        resolve();
      });
    });
    const updated = await new Promise<any>((resolve, reject) => {
      db.get('SELECT id, username, email, avatar_url, firstName, lastName, display_name FROM users WHERE id = ?', [id], function (err, updated) {
        if (err) return reject(err);
        resolve(updated);
      });
    });
    reply.send(updated);
  } catch (err) {
    reply.status(500).send({ error: 'DB error', details: err });
  }
});

// Delete user
server.delete('/users/:id', async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  try {
    db.get('SELECT id FROM users WHERE id = ?', [id], function (err, user) {
      if (err) return reply.status(500).send({ error: 'DB error', details: err });
      if (!user) return reply.status(404).send({ error: 'User not found' });
      db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
        if (err) return reply.status(500).send({ error: 'DB error', details: err });
        reply.status(204).send();
      });
    });
  } catch (err) {
    reply.status(500).send({ error: 'DB error', details: err });
  }
});

// List users
server.get('/users', async (_request: FastifyRequest, reply: FastifyReply) => {
  try {
    const users = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT id, username, email, avatar_url, firstName, lastName, display_name FROM users', [], function (err, users) {
        if (err) return reject(err);
        resolve(users);
      });
    });
    reply.send(users);
  } catch (err) {
    reply.status(500).send({ error: 'DB error', details: err });
  }
});

// Health check endpoint (no auth required)
server.get('/health', async (_request: FastifyRequest, reply: FastifyReply) => {
  reply.send({ status: 'ok', service: 'user-service' });
});

const start = async () => {
  try {
    db = new sqlite3.Database(dbPath);
    // Crea la taula si no existeix (només per a desenvolupament)
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
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
    // Registra les rutes d'avatar (si existeixen)
    setupAvatarRoutes(server, db);
    await server.listen({ port: 3002, host: '0.0.0.0' });
    server.log.info('User service started on https://0.0.0.0:3002');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
