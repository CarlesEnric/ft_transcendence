/**
 * API Configuration
 * Utilitza VITE_HOST_IP del fitxer .env_host_ip generat pel Makefile
 */

// Utilitzem les variables globals de window.APP_CONFIG per evitar problemes amb Vite
declare global {
  interface Window {
    APP_CONFIG: {
      apiUrl: string;
      hostIp: string;
      apiBaseUrl: string;
      wsUrl: string;
      authGoogleUrl: string;
      auth2faUrl: string;
      profileUrl: string;
    };
  }
}

// Obtenció de la IP del host de forma dinàmica
const HOST_IP = window.APP_CONFIG?.hostIp || 'localhost';

console.log('🌐 Frontend using HOST_IP:', HOST_IP);

export const API_CONFIG = {
  HOST_IP,
  
  // URLs dels endpoints API - utilitzant els valors dinàmics de window.APP_CONFIG
  AUTH: {
    // Utilitzem els valors dinàmics si estan disponibles, o generem les URLs
    PROFILE: window.APP_CONFIG?.profileUrl || `https://${HOST_IP}:3000/api/auth/profile`,
    LOGOUT: `https://${HOST_IP}:3000/api/auth/logout`,
    GOOGLE: window.APP_CONFIG?.authGoogleUrl || `https://${HOST_IP}:3000/api/auth/google`,
    TWO_FA: {
      STATUS: window.APP_CONFIG?.auth2faUrl ? `${window.APP_CONFIG.auth2faUrl}/status` : `https://${HOST_IP}:3000/api/auth/2fa/status`,
      SETUP: window.APP_CONFIG?.auth2faUrl ? `${window.APP_CONFIG.auth2faUrl}/setup` : `https://${HOST_IP}:3000/api/auth/2fa/setup`,
      VERIFY: window.APP_CONFIG?.auth2faUrl ? `${window.APP_CONFIG.auth2faUrl}/verify` : `https://${HOST_IP}:3000/api/auth/2fa/verify`,
      DISABLE: window.APP_CONFIG?.auth2faUrl ? `${window.APP_CONFIG.auth2faUrl}/disable` : `https://${HOST_IP}:3000/api/auth/2fa/disable`,
      REGENERATE_BACKUP: window.APP_CONFIG?.auth2faUrl ? `${window.APP_CONFIG.auth2faUrl}/regenerate-backup-codes` : `https://${HOST_IP}:3000/api/auth/2fa/regenerate-backup-codes`,
    }
  },
  
  GAME: {
    WS: window.APP_CONFIG?.wsUrl ? `${window.APP_CONFIG.wsUrl}/ws/game` : `wss://${HOST_IP}:3000/ws/game`,
  }
} as const;
