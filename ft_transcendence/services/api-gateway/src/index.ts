/**
 * API Gateway - Main entry point
 * Modular architecture with separated concerns
 */

import { config } from './config/index.js';
import { createServer, createRedirectServer } from './server.js';
import { registerAllMiddleware } from './middleware/index.js';
import { setupAllProxyRoutes } from './routes/proxy.js';
import { setupWebSocketRoutes } from './routes/websocket.js';
import { setupHealthRoutes } from './routes/health.js';
import { setupErrorHandlers, setupGracefulShutdown, startServer, startRedirectServer } from './utils/index.js';
import { ServerInstance } from './types/index.js';

/**
 * Main application setup
 */
const main = async (): Promise<void> => {
  // Create main HTTPS server instance
  const server: ServerInstance = createServer(config);

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

  // Start main HTTPS server
  await startServer(server, config);

  // Start HTTP redirect server if SSL is enabled
  if (config.ssl.enabled) {
    const redirectServer = createRedirectServer(config);
    setupGracefulShutdown(redirectServer);
    await startRedirectServer(redirectServer, config);
  }
};

// Start the application
main().catch((error) => {
  console.error('Failed to start API Gateway:', error);
  process.exit(1);
});
