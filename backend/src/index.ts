import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import fs from 'fs';
import betterSqlite3 from 'better-sqlite3';

const fastify = Fastify({
  https: {
    key: fs.readFileSync('/app/key.pem'),
    cert: fs.readFileSync('/app/cert.pem'),
  },
  logger: {
    level: 'debug',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  }
});

// Types
interface UserPayload {
  email: string;
  name: string;
}

// Extend Fastify types
declare module 'fastify' {
  interface FastifyRequest {
    currentUser?: UserPayload;
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

// DB
const db = betterSqlite3('/app/db/db.sqlite');

// Plugins
fastify.register(cookie);
fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'supersecret'
});

// Auth middleware
fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    let token: string | null = null;

    if (request.cookies?.token) token = request.cookies.token;
    if (!token && request.headers.authorization?.startsWith('Bearer '))
      token = request.headers.authorization.slice(7);

    if (!token) return reply.status(401).send({ error: 'Unauthorized: No token provided' });

    const decoded = await fastify.jwt.verify<UserPayload>(token);
    request.currentUser = decoded;
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized: Invalid token' });
  }
});

// Routes
fastify.get('/api/hello', { preHandler: fastify.authenticate }, async (request, reply) => {
  const user = request.currentUser!;
  const row = db.prepare('SELECT datetime("now") as now').get() as { now: string };

  reply.send({
    message: `Hola ${user.name}!`,
    email: user.email,
    time: row.now
  });
});

fastify.get('/api/public', async (_request, reply) => {
  reply.send({ message: 'Aquesta ruta és pública' });
});

// Start servers
const start = async () => {
  try {
    await fastify.listen({ port: 7000, host: "0.0.0.0" });
    fastify.log.info("Backend running on https://localhost:7000");

    // HTTP redirect
    const redirect = Fastify();
    redirect.all('*', (request, reply) => {
      const host = request.headers.host?.replace(/:\d+$/, ':7000') || '';
      reply.status(301).redirect(`https://${host}${request.url}`);
    });
    await redirect.listen({ port: 7080, host: "0.0.0.0" });
    console.log("HTTP redirect server running on http://localhost:7080");

  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

