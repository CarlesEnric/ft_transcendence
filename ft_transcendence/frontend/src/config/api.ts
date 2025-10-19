/**
 * API Configuration
 */

// Vite injecta automàticament les variables VITE_* dels fitxers .env en temps de construcció
// const DOMAIN = 'bcn42.duckdns.org:3000';
// const DOMAIN = 'bcn-project.duckdns.org:3000';
const DOMAIN = 'corb-project.duckdns.org:3000';
// const DOMAIN = 'domain42.duckdns.org:3000';
// const DOMAIN = 'localhost:3000';
// const DOMAIN = 'bcn-transcendence.duckdns.org:3000';
// const DOMAIN = 'bcn-transcendence.duckdns.org:3000';

export const API_CONFIG = {
  DOMAIN,
  // URLs dels endpoints API
  AUTH: {
    PROFILE: `https://${DOMAIN}/api/auth/profile`,
    UPDATE_PROFILE: `https://${DOMAIN}/api/auth/profile`,
    DELETE_ACCOUNT: `https://${DOMAIN}/api/auth/account`,
    LOGOUT: `https://${DOMAIN}/api/auth/logout`,
    GOOGLE: `https://${DOMAIN}/api/auth/google`,
    TWO_FA: {
      STATUS: `https://${DOMAIN}/api/auth/2fa/status`,
      SETUP: `https://${DOMAIN}/api/auth/2fa/setup`,
      VERIFY: `https://${DOMAIN}/api/auth/2fa/verify`
    },
  },

  GAME: {
    // Força sempre wss:// per WebSocket
    WS: `wss://${DOMAIN}/ws/game`,
  },
} as const;
