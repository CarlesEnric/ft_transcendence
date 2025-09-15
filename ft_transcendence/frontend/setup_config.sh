#!/bin/sh
# Script per generar els fitxers de configuració dinàmicament

# Detectem la IP automàticament de diferents maneres
detect_host_ip() {
    # Prioritat: HOST_IP > IP des de route > hostname -i > localhost
    if [ -n "$HOST_IP" ]; then
        echo "$HOST_IP"
    elif command -v ip > /dev/null 2>&1; then
        # Obtenim la IP de la ruta per defecte (més confiable en containers)
        ip route get 1 2>/dev/null | awk '{print $7}' | head -1
    elif command -v hostname > /dev/null 2>&1; then
        hostname -i 2>/dev/null | awk '{print $1}'
    else
        echo "localhost"
    fi
}

# Detectem la IP del host
DETECTED_IP=$(detect_host_ip)
echo "🔍 IP detectada: ${DETECTED_IP}"

# Generem el config.js dinàmic
cat > /app/dist/config.js << EOL
// Configuració dinàmica generada per setup_config.sh
window.APP_CONFIG = {
  apiBaseUrl: 'https://${DETECTED_IP}:3000',
  apiUrl: 'https://${DETECTED_IP}:3000/api',
  hostIp: '${DETECTED_IP}',
  wsUrl: 'wss://${DETECTED_IP}:3000',
  authGoogleUrl: 'https://${DETECTED_IP}:3000/api/auth/google',
  auth2faUrl: 'https://${DETECTED_IP}:3000/api/auth/2fa',
  profileUrl: 'https://${DETECTED_IP}:3000/api/auth/profile'
};
console.log('🔧 Config carregada amb HOST_IP:', '${DETECTED_IP}');
EOL

echo "✅ Configuració completa amb HOST_IP: ${DETECTED_IP}"
