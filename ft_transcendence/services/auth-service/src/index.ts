
import 'dotenv/config';
/**
 * Auth Service Main Entry Point
 * Modular architecture with separated concerns
 */

import { createServer, createDatabase, startServer } from './server.js';
import { registerAllMiddleware } from './middleware/auth.middleware.js';
import { setupHealthRoutes } from './routes/health.js';
import { setupAuthRoutes } from './routes/auth.js';
import { registerOAuthRoutes } from './routes/oauth2.js';
import { setup2FARoutes } from './routes/twoFactor.js';

/**
 * Main application setup
 */
const main = async (): Promise<void> => {
  // Create server and database instances
  const server = createServer();
  const db = createDatabase();

  // Register middleware (includes JWT and OAuth2 plugins)
  await registerAllMiddleware(server);

  // Setup routes
  setupHealthRoutes(server);
  setupAuthRoutes(server, db);
  setup2FARoutes(server, db);
  await registerOAuthRoutes(server, { db });

  // Setup graceful shutdown handlers
  setupGracefulShutdown(server, db);

  // Start server
  await startServer(server);
};

/**
 * Setup graceful shutdown handlers
 */
function setupGracefulShutdown(server: any, db: any): void {
  const gracefulShutdown = async (signal: string) => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    
    try {
      // Close server
      if (server) {
        await server.close();
        console.log('Server closed');
      }
      
      // Close database
      if (db) {
        db.close();
        console.log('Database closed');
      }
    } catch (error) {
      console.error('Error during shutdown:', error);
    } finally {
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

// Start the service
main().catch(error => {
  console.error('Failed to start Auth Service:', error);
  process.exit(1);
});
