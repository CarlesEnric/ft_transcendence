/**
 * WebSocket routes for real-time communication
 */

import { WebSocketConnection, WebSocketRequest } from '../types/gateway.types.js';
import { FastifyInstance } from 'fastify';

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
          // Fetch current game state from game service (internal HTTP communication)
          const url = 'http://game:3000/state';
          const response = await (global as any).fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          }).catch(() => {
            // Fallback if fetch is not available
            return null;
          });
          
          if (response && response.ok) {
            const gameState = await response.json();
            // Send game state to frontend
            connection.send(JSON.stringify(gameState));
          } else {
            // Fallback HTTP implementation
            const http = eval('require')('http');
            const options = {
              hostname: 'game',
              port: 3000,
              path: '/state',
              method: 'GET'
            };
            
            const req = http.request(options, (res: any) => {
              let data = '';
              res.on('data', (chunk: any) => data += chunk);
              res.on('end', () => {
                try {
                  const gameState = JSON.parse(data);
                  connection.send(JSON.stringify(gameState));
                } catch (error: any) {
                  server.log.warn('Error parsing game state:', error.message);
                }
              });
            });
            
            req.on('error', (error: any) => {
              server.log.warn('Error fetching game state:', error.message);
            });
            
            req.end();
          }
        } catch (error: any) {
          server.log.warn('Error in game state interval:', error.message);
        }
      }, 16); // 60 FPS = ~16ms intervals
      
      // Forward messages from client to game service via HTTP (for controls)
      connection.on('message', async (message: any) => {
        const messageStr = message.toString();
        
        try {
          const data = JSON.parse(messageStr);
          
          // Use fetch with a polyfill approach (internal HTTP communication)
          const url = 'http://game:3000/api/move';
          const response = await (global as any).fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: messageStr
          }).catch(() => {
            // Fallback if fetch is not available
            return null;
          });
          
          if (response && response.ok) {
            // Note: Game state is now sent continuously above, not just on moves
          } else {
            // Manual HTTP implementation as fallback
            const http = eval('require')('http');
            const postData = messageStr;
            
            const options = {
              hostname: 'game',
              port: 3000,
              path: '/api/move',
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length
              }
            };
            
            const req = http.request(options, (res: any) => {
              if (res.statusCode !== 200) {
                server.log.warn('HTTP request failed (fallback):', res.statusCode);
              }
            });
            
            req.on('error', (error: any) => {
              server.log.error('HTTP request error (fallback):', error.message);
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
