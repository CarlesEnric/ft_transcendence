import Fastify from 'fastify';
// import sqlite3 from 'sqlite3';
import betterSqlite3 from 'better-sqlite3';
import fs from 'fs';

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


const db = betterSqlite3('/app/db/db.sqlite');

fastify.get('/api/hello', (request, reply) => {
  try {
    const row = db.prepare('SELECT datetime("now") as now').get() as { now: string };
    reply.send({ message: 'Hello from backend!', time: row.now });
  } catch (err: any) {
    reply.status(500).send({ error: err.message });
  }
});


const start = async () => {
  try {
    // Start HTTPS server
    await fastify.listen({ port: 7000, host: "0.0.0.0" });
    fastify.log.info("Backend running on https://localhost:7000");

    // Start HTTP redirect server
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