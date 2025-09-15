import type { FastifyInstance } from 'fastify';
import { registerMatchDocs } from './matchRoutes.js';
import * as http from 'http';

/**
 * Registra todos los endpoints documentados para Swagger.
 */
export async function registerAllDocs(fastify: FastifyInstance<http.Server, http.IncomingMessage, http.ServerResponse>): Promise<void> {
  await registerMatchDocs(fastify);
}