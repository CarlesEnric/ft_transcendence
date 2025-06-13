import Fastify from 'fastify';
import sqlite3 from 'sqlite3';
import fs from 'fs';

const fastify = Fastify({
  https: {
    key: fs.readFileSync('/app/key.pem'),
    cert: fs.readFileSync('/app/cert.pem'),
  }
});
const db = new sqlite3.Database('/app/db/db.sqlite');

fastify.get('/api/hello', (request, reply) => {
  db.all('SELECT datetime("now") as now', (err, rows) => {
    if (err) {
      reply.status(500).send({ error: err.message });
      return;
    }
    // Indica el tipus explícitament
    const row = rows[0] as { now: string };
    reply.send({ message: 'Hello from backend!', time: row.now });
  });
});

// HTTP redirect server
const redirect = Fastify();
redirect.all('*', (request, reply) => {
  const host = request.headers.host?.replace(/:\d+$/, ':7000') || '';
  reply.redirect(301, `https://${host}${request.raw.url}`);
});

async function start_listen() {
  try {
    const address = await fastify.listen({ port: 7000, host: '0.0.0.0' });
    console.log('Auth server running on', address);

    const redirectAddress = await redirect.listen({ port: 7080, host: '0.0.0.0' });
    console.log('HTTP redirect server running on', redirectAddress);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }  
}

start_listen();