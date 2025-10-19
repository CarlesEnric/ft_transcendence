import { FastifyInstance } from 'fastify';
import globalSseRoute from './globalSse.js';

export function setupGlobalSseRoute(server: FastifyInstance) {
  globalSseRoute(server);
}
