/**
 * WebSocket routes for real-time communication
 */

import { WebSocketConnection, WebSocketRequest } from '../types/gateway.types.js';
import { FastifyInstance } from 'fastify';
import https from 'https';

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
      
      // Start sending game state updates every 16ms (60 FPS)
      const gameStateInterval = setInterval(async () => {
        try {
          // Fetch current game state from game service (internal HTTPS communication)
          const url = 'https://game:3003/state';
          const response = await (global as any).fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            // Accept self-signed certs in Docker/dev
            agent: new https.Agent({ rejectUnauthorized: false })
          }).catch((fetchError: any) => {
            server.log.error('[WS-GW] Fetch error (game state):', fetchError && fetchError.stack ? fetchError.stack : fetchError);
            // Fallback if fetch is not available
            return null;
          });

          if (response && response.ok) {
            const gameState = await response.json();
            server.log.info('[WS-GW] Game state received from game-service (fetch):', gameState);
            // Send game state to frontend
            connection.send(JSON.stringify(gameState));
            server.log.info('[WS-GW] Game state sent to frontend (fetch)');
          } else {
            // Fallback HTTPS implementation
            const options = {
              hostname: 'game',
              port: 3003,
              path: '/state',
              method: 'GET',
              rejectUnauthorized: false // Accept self-signed certs
            };
            const req = https.request(options, (res: any) => {
              let data = '';
              res.on('data', (chunk: any) => data += chunk);
              res.on('end', () => {
                try {
                  const gameState = JSON.parse(data);
                  server.log.info('[WS-GW] Game state received from game-service (fallback):', gameState);
                  connection.send(JSON.stringify(gameState));
                  server.log.info('[WS-GW] Game state sent to frontend (fallback)');
                } catch (error: any) {
                  server.log.warn('Error parsing game state:', error && error.stack ? error.stack : error);
                }
              });
            });
            req.on('error', (error: any) => {
              server.log.warn('Error fetching game state (fallback):', error && error.stack ? error.stack : error);
            });
            req.end();
          }
        } catch (error: unknown) {
          let errorMsg = '';
          if (error instanceof Error) {
            errorMsg = error.stack || error.message;
          } else if (typeof error === 'object' && error !== null) {
            try {
              errorMsg = JSON.stringify(error);
            } catch {
              errorMsg = String(error);
            }
          } else {
            errorMsg = String(error);
          }
          server.log.warn(`Error in game state interval (outer catch): ${errorMsg}`);
        }
      }, 16); // 60 FPS = ~16ms intervals
      
      // Forward messages from client to game service via HTTP (for controls)
      connection.on('message', async (message: any) => {
        const messageStr = message.toString();
        
        try {
          const data = JSON.parse(messageStr);
          
          // Use fetch with a polyfill approach (internal HTTPS communication)
          const url = 'https://game:3003/api/move';
          const response = await (global as any).fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: messageStr,
            agent: new https.Agent({ rejectUnauthorized: false })
          }).catch(() => {
            // Fallback if fetch is not available
            return null;
          });
          
          if (response && response.ok) {
            // Note: Game state is now sent continuously above, not just on moves
          } else {
            // Manual HTTPS implementation as fallback
            const postData = messageStr;
            const options = {
              hostname: 'game',
              port: 3003,
              path: '/api/move',
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length
              },
              rejectUnauthorized: false // Accept self-signed certs
            };
            const req = https.request(options, (res: any) => {
              if (res.statusCode !== 200) {
                server.log.warn('HTTPS request failed (fallback):', res.statusCode);
              }
            });
            req.on('error', (error: any) => {
              server.log.error('HTTPS request error (fallback):', error.message);
            });
            req.write(postData);
            req.end();
          }
          
        } catch (error: any) {
          server.log.error('Error parsing message for HTTP send:', error.message);
        }
      });

      // Handle connection closures
      connection.on('close', () => {
        server.log.info('Client WebSocket connection closed');
        clearInterval(gameStateInterval);
      });

      // Handle errors
      connection.on('error', (error: any) => {
        server.log.error('Client WebSocket error:', error);
        clearInterval(gameStateInterval);
      });
    });
  });
};
