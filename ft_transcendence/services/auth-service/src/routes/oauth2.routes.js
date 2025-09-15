/**
 * Fitxer generat automàticament per setup_host_ip.sh
 * Conté helpers per gestionar el flux d'autenticació OAuth amb IP personalitzada
 */

const HOST_IP = "192.168.1.56";
const FRONTEND_URL = "https://192.168.1.56:3000";

/**
 * Detecta l'origen de la petició i guarda aquesta informació
 * per usar-la en les redireccions post-autenticació
 */
export function detectRequestOrigin(request) {
  // L'origen pot ser l'adreça IP o localhost
  const host = request.headers.host || '';
  const isIP = /^\d+\.\d+\.\d+\.\d+/.test(host);
  
  // Per a l'autenticació amb Google SEMPRE utilitzem localhost
  // però volem redirigir a la IP original després
  return {
    detectedHost: host,
    isIP: isIP,
    redirectAfterAuth: isIP ? FRONTEND_URL : "https://localhost:3000"
  };
}

/**
 * Determina l'URL de redirecció final després de l'autenticació
 */
export function getFinalRedirectUrl(request, defaultPath = '') {
  // Sempre redirigim a la IP configurada, mai a localhost
  // Això permet l'accés des de qualsevol màquina a la xarxa
  return `${FRONTEND_URL}${defaultPath}`;
}
