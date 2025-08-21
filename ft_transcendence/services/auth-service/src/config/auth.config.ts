/**
 * Configuration settings for the Auth Service
 * Centralizes all environment variable handling
 */

export interface AppConfig {
  port: number;
  host: string;
  nodeEnv: string;
  logLevel: string;
  dbPath: string;
  ssl: {
    enabled: boolean;
    keyPath: string;
    certPath: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  bcrypt: {
    rounds: number;
  };
  oauth: {
    google: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
      scope: string[];
    };
  };
  frontend: {
    url: string;
  };
}

/**
 * Load and validate configuration from environment variables
 */
export const loadConfig = (): AppConfig => {
  return {
    port: parseInt(process.env.PORT || '3001', 10),
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    dbPath: process.env.DB_PATH || '/app/database/auth.db',
    
    ssl: {
      enabled: process.env.SSL_ENABLED === 'true',
      keyPath: process.env.SSL_KEY_PATH || '/app/ssl/key.pem',
      certPath: process.env.SSL_CERT_PATH || '/app/ssl/cert.pem',
    },
    
    jwt: {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },
    
    bcrypt: {
      rounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    },

    oauth: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirectUri: process.env.GOOGLE_REDIRECT_URI || 'https://localhost:3000/api/auth/google/callback',
        scope: ['openid', 'profile', 'email'],
      },
    },

    frontend: {
      url: process.env.FRONTEND_URL || 'https://localhost:3000',
    },
  };
};

export const config = loadConfig();
