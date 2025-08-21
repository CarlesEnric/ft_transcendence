
import 'dotenv/config';
/**
 * API Gateway - Main entry point
 * Modular architecture with separated concerns
 */


import fs from 'fs';
import { config } from './config/gateway.config.js';
//import { createServer, createRedirectServer } from './server.js';
import { createServer } from './server.js';
import { registerAllMiddleware } from './middleware/gateway.middleware.js';
import { setupAllProxyRoutes } from './routes/proxy.js';
import { setupWebSocketRoutes } from './routes/websocket.js';
import { setupHealthRoutes } from './routes/health.js';
import { setupErrorHandlers, setupGracefulShutdown, startServer, startRedirectServer } from './utils/gateway.utils.js';
import { FastifyInstance } from 'fastify';

/**
 * Main application setup
 */
const main = async (): Promise<void> => {
  // Create main HTTPS server instance
  const server: FastifyInstance = createServer(config);

  // Register middleware
  await registerAllMiddleware(server, config);

  // Setup routes
  setupHealthRoutes(server, config);
  setupAllProxyRoutes(server, config);
  setupWebSocketRoutes(server);


  // Setup error handlers
  setupErrorHandlers(server, config);

  // Setup graceful shutdown
  setupGracefulShutdown(server);

  // Print all registered routes at startup and repeatedly for debugging (both logger and stdout and to file)
  {
    let count = 0;
    const interval = setInterval(() => {
      const routes = (server as any).printRoutes();
      const output = 'REGISTERED ROUTES (stdout):\n' + routes + '\n';
      console.log(output);
      try {
        fs.appendFileSync('/tmp/routes.txt', output);
      } catch (e) {
        console.error('Could not write /tmp/routes.txt:', e);
      }
      count++;
      if (count >= 15) clearInterval(interval);
    }, 2000);
  }

  // Start main HTTPS server
  await startServer(server, config);

  // Start HTTP redirect server if SSL is enabled
  // if (config.ssl.enabled) {
  //   const redirectServer = createRedirectServer(config);
  //   setupGracefulShutdown(redirectServer);
  //   await startRedirectServer(redirectServer, config);
  // }
};

// Start the application
main().catch((error) => {
  console.error('Failed to start API Gateway:', error);
  process.exit(1);
});
