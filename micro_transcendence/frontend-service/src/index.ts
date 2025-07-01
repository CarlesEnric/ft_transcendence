import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import helmet from '@fastify/helmet';

const fastify = Fastify({
  https: {
    key: fs.readFileSync('/app/key.pem'),
    cert: fs.readFileSync('/app/cert.pem'),
  },
  logger: true,
});

// Registra Helmet per a seguretat i CSP
await fastify.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://localhost:8000"], // Permet scripts inline per a facilitar el desenvolupament
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"], // Permet scripts inline per a facilitar el desenvolupament
    }
  }
});


// Serveix fitxers estàtics directament des de /public al root
fastify.register(fastifyStatic, {
  root: path.join(process.cwd(), 'public'),
  prefix: '/',
});


// Serveix fitxers estàtics per a la carpeta /assets i és una capçalera de seguretat Content-Security-Policy(CSP) i és necessari per evitar errors de seguretat
fastify.addHook('onSend', async (request, reply, payload) => {
  reply.header('Content-Security-Policy', "default-src 'self'; script-src 'self';");
  return payload;
});

// Get the current directory and file name to avoid 404 errors
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Serve static files for the SPA when not existing routes are requested
fastify.setNotFoundHandler((request, reply) => {
  reply.type('text/html').send(
    fs.readFileSync(path.join(__dirname, '../public/index.html'))
  );
});

const start = async () => {
  try {
    // Start HTTPS server
    await fastify.listen({ port: 7003, host: "0.0.0.0" });
    fastify.log.info("Frontend running on https://frontend-service:7003");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();