import 'dotenv/config';
import fastify from 'fastify';
import fs from 'node:fs';
import path from 'node:path';
import { initializeDb } from './database.setup.js';
import restRoutes from './routes/rest.routes.js';

const sslDir = '/app/ssl';
const app = fastify({
  logger: true,
  https: {
    key: fs.readFileSync(path.join(sslDir, 'key.pem')),
    cert: fs.readFileSync(path.join(sslDir, 'cert.pem')),
  },
});

app.get('/health', async () => ({ ok: true, service: 'match-service' }));

(async () =>
{
  try
  {
    const db = await initializeDb();
    app.decorate('db', db as any);
    app.addHook('onRequest', (req, _reply, done) => { (req as any).db = db; done(); });
    await app.register(restRoutes);
    const PORT = Number(process.env.PORT || 3004);
    const HOST = process.env.HOST || '0.0.0.0';
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Match-Service listening on https://${HOST}:${PORT}`);
  }
  catch (err)
  {
    app.log.error(err);
    process.exit(1);
  }
})();
