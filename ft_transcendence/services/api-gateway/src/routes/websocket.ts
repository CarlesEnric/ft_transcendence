/**
 * WebSocket routes for real-time communication
 */

import { WebSocketConnection, WebSocketRequest } from '../types/gateway.types.js';
import { FastifyInstance } from 'fastify';
import WebSocket from 'ws';

/**
 * Setup WebSocket routes with HTTP backend communication
 */
export const setupWebSocketRoutes = (server: FastifyInstance): void => {
  server.log.info('Setting up WebSocket routes...');
  
  server.register(async (fastify: any) => {
    server.log.info('Registering WebSocket routes in fastify...');
    
    // Game WebSocket endpoint
    fastify.get('/ws/game', { websocket: true }, (connection: any, request: any) => {
      server.log.info('WebSocket connection established for game');
      server.log.info('Client connecting to game service backend...');
      server.log.info('Request URL: %s', request.url);
      
      // Use HTTP for internal Docker communication (not HTTPS)
      // Pass the query parameters to the backend
      const backendUrl = `ws://game:3003/ws/game${request.url.includes('?') ? request.url.substring(request.url.indexOf('?')) : ''}`;
      server.log.info('Connecting to backend: %s', backendUrl);
      
      const backendWs = new WebSocket(backendUrl);

      backendWs.on('open', () => {
        server.log.info('Successfully connected to game-service backend');
      });

      backendWs.on('error', (error) => {
        server.log.error('Backend WebSocket connection error: %s', error.message || error.toString());
        if (connection && connection.close) {
          connection.close();
        }
      });

      // Forward del client al backend
      connection.on('message', (msg: any) => {
        server.log.info('Forwarding message from client to backend: %s', msg.toString());
        if (backendWs.readyState === WebSocket.OPEN) {
          backendWs.send(msg);
        } else {
          server.log.warn('Backend connection not ready, message dropped');
        }
      });

      // Forward del backend al client
      backendWs.on('message', (msg: any) => {
        server.log.info('Forwarding message from backend to client: %s', msg.toString());
        if (connection && connection.readyState === WebSocket.OPEN) {
          connection.send(msg);
        } else {
          server.log.warn('Client connection not ready, message dropped');
        }
      });

      // Handle connection closures
      connection.on('close', () => {
        server.log.info('Client connection closed, closing backend connection');
        backendWs.close();
      });
      
      backendWs.on('close', () => {
        server.log.info('Backend connection closed, closing client connection');
        if (connection && connection.close) {
          connection.close();
        }
      });
    });
  });
};
