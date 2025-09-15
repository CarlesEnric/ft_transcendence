#!/bin/sh
# Script per generar el fitxer config.js dinàmicament

# Obtenim la IP des de l'entorn
HOST_IP=${HOST_IP:-$(hostname -i)}

cat > /app/dist/config.js << EOL
// Configuració dinàmica generada per setup_config.sh
window.APP_CONFIG = {
  apiBaseUrl: 'https://${HOST_IP}:3000',
  apiUrl: 'https://${HOST_IP}:3000/api',
  hostIp: '${HOST_IP}',
  wsUrl: 'wss://${HOST_IP}:3000',
  authGoogleUrl: 'https://${HOST_IP}:3000/api/auth/google',
  auth2faUrl: 'https://${HOST_IP}:3000/api/auth/2fa',
  profileUrl: 'https://${HOST_IP}:3000/api/auth/profile'
};
EOL

echo "✅ Generat config.js amb HOST_IP: ${HOST_IP}"
