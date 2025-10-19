/**
 * Configuration settings for the API Gateway
 * Centralizes all environment variable handling
 */


export interface AppConfig {
  port: number;
  host: string;
  nodeEnv: string;
  ssl: {
    enabled: boolean;
    keyPath: string;
    certPath: string;
  };
  services: {
    auth: string;
    user: string;
    game: string;
    match: string;
  };
  frontend: {
    url: string;
    staticPath: string;
  };
  rateLimit: {
    max: number;
    timeWindow: number;
  };
  cors: {
    origin: string;
    methods: string[];
    credentials: boolean;
  };
}


/**
 * Load and validate configuration from environment variables
 */
export const loadConfig = (): AppConfig => {
  // Si SSL està activat, port per defecte 443; si no, 3000 per desenvolupament
  const sslEnabled = process.env.SSL_ENABLED === 'true';
  const defaultPort = sslEnabled ? 443 : 3000;
  return {
    port: parseInt(process.env.PORT || String(defaultPort), 10),
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
    
    ssl: {
      enabled: process.env.SSL_ENABLED === 'true',
      keyPath: process.env.SSL_KEY_PATH || '/app/ssl/key.pem',
      certPath: process.env.SSL_CERT_PATH || '/app/ssl/cert.pem',
    },
    
    services: {
      auth: process.env.AUTH_SERVICE_URL || 'http://auth:3001',
      user: process.env.USER_SERVICE_URL || 'http://user:3002',
      game: process.env.GAME_SERVICE_URL || 'http://game:3003',
      match: process.env.MATCH_SERVICE_URL || 'http://match:3004',
    },
    
    frontend: {
      url: process.env.FRONTEND_URL || '',
      staticPath: '/app/frontend',
    },
    
    rateLimit: {
      max: parseInt(process.env.RATE_LIMIT_MAX || '1000', 10), // requests per timeWindow (default 100) - decimal base 10 value
      timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10), // in milliseconds (1 minute default) - decimal base 10 value
    },
    
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: (process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,PATCH,OPTIONS').split(','),
      credentials: process.env.CORS_CREDENTIALS === 'true',
    },
  };
};

export const config = loadConfig();
