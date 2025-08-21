import fastify from 'fastify';
import websocket from '@fastify/websocket';
import { readFileSync } from 'fs';
import 'dotenv/config';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';

// Create HTTPS server for external access
const httpsServer = fastify({
  logger: { level: 'info' },
  https: {
    key: readFileSync('/app/ssl/key.pem'),
    cert: readFileSync('/app/ssl/cert.pem')
  }
});

// Create HTTP server for internal service communication
const httpServer = fastify({
  logger: { level: 'info' }
});

// Register JWT and Cookie plugins on both servers
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set');
}

httpsServer.register(fastifyJwt, { secret: process.env.JWT_SECRET });
httpsServer.register(fastifyCookie);
httpServer.register(fastifyJwt, { secret: process.env.JWT_SECRET });
httpServer.register(fastifyCookie);

// Register WebSocket plugin on both servers
httpsServer.register(websocket);
httpServer.register(websocket);

// Configuration flag - set to true to enforce JWT authentication for WebSocket connections
const ENFORCE_JWT_AUTH = process.env.ENFORCE_JWT_AUTH === 'true' || false;

interface MoveMsg {
  type: "move";
  player: "left" | "right";
  direction: "up" | "down";
}

/**
 * Validates JWT token from WebSocket connection request
 * Safe function - only validates, doesn't affect existing functionality
 */
const validateWebSocketJWT = async (request: any, server: any): Promise<any> => {
  try {
    // Try to get token from cookies first (priority)
    let token = request.cookies?.token;
    
    // If no cookie, try Authorization header
    if (!token) {
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      server.log.debug('No JWT token found in WebSocket connection');
      return null;
    }
    
    // Verify the token
    const decoded = server.jwt.verify(token);
    server.log.debug(`JWT validated for user: ${decoded.userId || decoded.sub}`);
    return decoded;
  } catch (error: any) {
    server.log.warn(`JWT validation failed: ${error.message}`);
    return null;
  }
};

interface GameState {
  ball: { x: number; z: number; vx: number; vz: number };
  paddles: { left: number; right: number };
  score: { left: number; right: number };
}

const state: GameState = {
  ball: { x: 0, z: 0, vx: 0.08, vz: 0.04 },
  paddles: { left: 0, right: 0 },
  score: { left: 0, right: 0 }
};

const clients = new Set<any>();

// Setup WebSocket endpoint on both servers
const setupWebSocketEndpoint = (server: any) => {
  server.get('/ws/game', { websocket: true }, (connection: any, req: any) => {
    const socket = connection.socket;
    
    // STEP 3: Enhanced JWT validation with configurable enforcement
    validateWebSocketJWT(req, server).then((user) => {
      if (user) {
        // Valid JWT - log successful authentication
        server.log.info(`Authenticated WebSocket connection for user: ${user.userId || user.sub}`);
        // Add user info to socket for future use
        socket.userId = user.userId || user.sub;
        socket.isAuthenticated = true;
        
        // Continue with connection setup
        setupSocketConnection(socket, server);
        
      } else {
        // No valid JWT found
        if (ENFORCE_JWT_AUTH) {
          // STRICT MODE: Block connection without valid JWT
          server.log.warn('WebSocket connection BLOCKED - no valid JWT token');
          socket.close(1008, 'Authentication required'); // Policy Violation close code
          return;
        } else {
          // COMPATIBILITY MODE: Allow connection but mark as unauthenticated
          server.log.warn('WebSocket connection without valid JWT - allowing for compatibility');
          socket.isAuthenticated = false;
          
          // Continue with connection setup
          setupSocketConnection(socket, server);
        }
      }
    }).catch((error) => {
      server.log.error('Error during JWT validation:', error);
      socket.isAuthenticated = false;
      
      if (ENFORCE_JWT_AUTH) {
        // STRICT MODE: Block connection on validation error
        server.log.warn('WebSocket connection BLOCKED - JWT validation error');
        socket.close(1011, 'Authentication error');
        return;
      } else {
        // COMPATIBILITY MODE: Allow connection despite validation error
        setupSocketConnection(socket, server);
      }
    });
  });
  
  // Helper function to setup socket connection and event handlers
  const setupSocketConnection = (socket: any, server: any) => {
    server.log.info('New WebSocket connection established');
    clients.add(socket);

    socket.on('message', (msg: any) => {
      try {
        const data = JSON.parse(msg.toString()) as MoveMsg;
        if (data.type === 'move') {
          const delta = data.direction === 'up' ? -0.8 : 0.8;
          state.paddles[data.player] = Math.max(
            -10.5, // Ajustat per camp 24x16
            Math.min(10.5, state.paddles[data.player] + delta) // Ajustat per camp 24x16
          );
        }
      } catch (e) {
        server.log.error('Error parsing message:', e);
      }
    });

    socket.on('close', () => {
      server.log.info('WebSocket connection closed');
      clients.delete(socket);
    });

    socket.on('error', (error: any) => {
      server.log.warn('WebSocket error:', error);
    });
  };
};

setupWebSocketEndpoint(httpsServer);
setupWebSocketEndpoint(httpServer);

// Game loop (60 FPS)
setInterval(() => {
  // Update ball position
  state.ball.x += state.ball.vx;
  state.ball.z += state.ball.vz;

  // Top and bottom wall bouncing - ajustat per canvas 16x24
  if (state.ball.z > 11.5 || state.ball.z < -11.5) {
    state.ball.vz *= -1;
  }

  // Left paddle collision - ajustat per noves dimensions
  if (state.ball.x < -6.5 && state.ball.x > -7.5 && 
      Math.abs(state.ball.z - state.paddles.left) < 1 && state.ball.vx < 0) {
    state.ball.vx *= -1;
    // Add angle based on hit position
    const hitPosition = (state.ball.z - state.paddles.left) / 1; // -1 to 1
    state.ball.vz += hitPosition * 0.03; // Add vertical component
  }
  
  // Right paddle collision - ajustat per noves dimensions
  if (state.ball.x > 6.5 && state.ball.x < 7.5 && 
      Math.abs(state.ball.z - state.paddles.right) < 1 && state.ball.vx > 0) {
    state.ball.vx *= -1;
    // Add angle based on hit position
    const hitPosition = (state.ball.z - state.paddles.right) / 1; // -1 to 1
    state.ball.vz += hitPosition * 0.03; // Add vertical component
  }

  // Left goal (right player scores) - ajustat per noves dimensions
  if (state.ball.x < -8) {
    state.score.right++;
    state.ball.x = 0;
    state.ball.z = 0;
    state.ball.vx = 0.08;
    state.ball.vz = (Math.random() - 0.5) * 0.06;
  }
  
  // Right goal (left player scores) - ajustat per noves dimensions
  if (state.ball.x > 8) {
    state.score.left++;
    state.ball.x = 0;
    state.ball.z = 0;
    state.ball.vx = -0.08;
    state.ball.vz = (Math.random() - 0.5) * 0.06;
  }

  const payload = JSON.stringify({
    ball: { x: state.ball.x, z: state.ball.z },
    paddles: state.paddles,
    score: state.score
  });

  for (const client of clients) {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(payload);
    }
  }
}, 1000 / 60);

// Setup health and root endpoints on both servers
const setupEndpoints = (server: any) => {
  server.get('/health', async (_req: any, reply: any) => {
    reply.send({ status: 'ok', service: 'game-service' });
  });

  server.get('/', async (_req: any, reply: any) => {
    reply.send({ message: 'Game service - ready for development' });
  });

  server.get('/state', async (_req: any, reply: any) => {
    reply.send({
      ball: state.ball,
      paddles: state.paddles,
      score: state.score
    });
  });

  // HTTP endpoint for receiving move commands
  server.post('/api/move', async (req: any, reply: any) => {
    try {
      const data = req.body as MoveMsg;
      if (data.type === 'move') {
        const delta = data.direction === 'up' ? -0.8 : 0.8;
        state.paddles[data.player] = Math.max(
          -10.5, // Ajustat per camp 24x16
          Math.min(10.5, state.paddles[data.player] + delta) // Ajustat per camp 24x16
        );
        
        // Send current game state back in HTTP response
        const gameState = {
          ball: state.ball,
          paddles: state.paddles,
          score: state.score
        };
        
        reply.send({ 
          success: true, 
          message: 'Move processed',
          gameState: gameState
        });
      } else {
        reply.status(400).send({ error: 'Invalid move command' });
      }
    } catch (error: any) {
      server.log.error('Error processing move:', error.message);
      reply.status(500).send({ error: 'Internal server error' });
    }
  });
};

setupEndpoints(httpsServer);
setupEndpoints(httpServer);

// Start both servers
const start = async () => {
  try {
    // Start HTTPS server on port 3003 for internal communication
    await httpsServer.listen({ port: 3003, host: '0.0.0.0' });
    httpsServer.log.info('Game service HTTPS started on https://0.0.0.0:3003');
    
    // Start HTTP server on port 3000 for legacy compatibility
    await httpServer.listen({ port: 3000, host: '0.0.0.0' });
    httpServer.log.info('Game service HTTP started on http://0.0.0.0:3000');
  } catch (err) {
    httpsServer.log.error(err);
    process.exit(1);
  }
};

start();
