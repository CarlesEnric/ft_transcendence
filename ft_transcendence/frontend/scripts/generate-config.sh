#!/bin/bash

# Script per generar un fitxer de configuració dinàmica per al frontend
# Aquest script s'executarà en temps de construcció o en temps d'execució al contenidor

# Obtenim la IP del host des de la variable d'entorn o usem un valor per defecte
HOST_IP=${HOST_IP:-"192.168.1.56"}

# Creem el fitxer config.js que serà servit estàticament
cat > /app/dist/config.js << EOF
// Configuració dinàmica generada per script - NO EDITAR MANUALMENT
window.APP_CONFIG = {
  apiBaseUrl: 'https://${HOST_IP}:3000',
  apiUrl: 'https://${HOST_IP}:3000/api',
  hostIp: '${HOST_IP}',
  wsUrl: 'wss://${HOST_IP}:3000',
  authGoogleUrl: 'https://${HOST_IP}:3000/api/auth/google',
  auth2faUrl: 'https://${HOST_IP}:3000/api/auth/2fa',
  profileUrl: 'https://${HOST_IP}:3000/api/auth/profile'
};
console.log('🔧 Config carregada amb HOST_IP:', '${HOST_IP}');
EOF

echo "✅ Fitxer config.js generat correctament amb HOST_IP=${HOST_IP}"
