/**
 * WebSocket routes for real-time communication
 * Handles WebSocket connections for games
 */

import { ServerInstance, WebSocketConnection, WebSocketRequest } from '../types/index.js';

/**
 * Setup WebSocket routes
 */
export const setupWebSocketRoutes = (server: ServerInstance): void => {
  server.register(async (fastify: any) => {
    // Game WebSocket endpoint
    fastify.get('/ws/game', { websocket: true }, (connection: WebSocketConnection, request: WebSocketRequest) => {
      server.log.info('WebSocket connection established for game');
      
      connection.on('message', (message: any) => {
        server.log.debug('WebSocket message received:', message.toString());
        // TODO: Forward to game service WebSocket
      });
      
      connection.on('close', () => {
        server.log.info('WebSocket connection closed');
      });
    });
  });
};
