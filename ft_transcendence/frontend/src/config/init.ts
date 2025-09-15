// Aquest script s'executa abans que la resta de l'aplicació
// i configura les variables globals basades en l'entorn

// Llegim la IP del host des de l'etiqueta meta
const getHostIp = () => {
  const metaHostIp = document.querySelector('meta[name="host-ip"]')?.getAttribute('content');
  return metaHostIp || 'localhost';
};

const hostIp = getHostIp();

// Configurem l'objecte global APP_CONFIG
window.APP_CONFIG = {
  apiBaseUrl: `https://${hostIp}:3000`,
  apiUrl: `https://${hostIp}:3000/api`,
  hostIp: hostIp,
  wsUrl: `wss://${hostIp}:3000`,
  authGoogleUrl: `https://${hostIp}:3000/api/auth/google`,
  auth2faUrl: `https://${hostIp}:3000/api/auth/2fa`,
  profileUrl: `https://${hostIp}:3000/api/auth/profile`
};

console.log('🔧 Config inicialitzat amb HOST_IP:', hostIp);
