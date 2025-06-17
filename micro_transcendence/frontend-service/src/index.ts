import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const fastify = Fastify({
  https: {
    key: fs.readFileSync('/app/key.pem'),
    cert: fs.readFileSync('/app/cert.pem'),
  },
  logger: true,
});


// Serveix fitxers estàtics directament des de /public al root
fastify.register(fastifyStatic, {
  root: path.join(process.cwd(), 'public'),
  prefix: '/',
});


// Serveix fitxers estàtics per a la carpeta /assets
fastify.addHook('onSend', async (request, reply, payload) => {
  reply.header('Content-Security-Policy', "default-src 'self'; script-src 'self';");
  return payload;
});


const start = async () => {
  try {
    // Start HTTPS server
    await fastify.listen({ port: 7002, host: "0.0.0.0" });
    fastify.log.info("Frontend running on https://localhost:7002");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();