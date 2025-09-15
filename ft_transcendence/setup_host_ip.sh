#!/bin/bash
# Script per configurar els serveis amb la IP de l'ordinador host
# Aquest script detecta la IP de l'ordinador i configura els fitxers .env_host_ip per a cada servei

# Colors per a l'output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}     CONFIGURACIÓ DE LA IP DE L'HOST        ${NC}"
echo -e "${BLUE}=============================================${NC}"

# Obtenim la IP de l'ordinador
HOST_IP=$(ip route get 1.1.1.1 | grep -oP 'src \K\S+')

if [ -z "$HOST_IP" ]; then
    echo -e "${RED}Error: No s'ha pogut detectar la IP local${NC}"
    exit 1
fi

echo -e "IP detectada: ${GREEN}$HOST_IP${NC}"

# Directori base del projecte
BASE_DIR="$(dirname "$(realpath "$0")")"

# Funció per crear o actualitzar un fitxer .env_host_ip
update_env_file() {
    local service_dir="$1"
    local service_name="$2"
    local env_file="$service_dir/.env_host_ip"

    echo -e "Configurant ${BLUE}$service_name${NC}..."
    
    # Crear o sobreescriure el fitxer .env_host_ip
    cat > "$env_file" << ENVEOF
# Configuració automàtica per $service_name
# Generat per setup_host_ip.sh

# Utilitzar la IP de l'ordinador host per permetre connexions des d'altres dispositius
HOST_IP=$HOST_IP

# Secret compartit per JWT (assegurant-nos que tots els serveis utilitzen el mateix)
JWT_SECRET=ft_transcendence_jwt_secret_keep_secure

# Configuració addicional específica per a cada servei
NODE_ENV=development
LOG_LEVEL=debug
ENVEOF

    echo -e "${GREEN}✓${NC} Fitxer .env_host_ip creat per a $service_name"
}

# Actualitzar fitxers .env_host_ip per a cada servei
update_env_file "$BASE_DIR/services/api-gateway" "API Gateway"
update_env_file "$BASE_DIR/services/auth-service" "Auth Service"
update_env_file "$BASE_DIR/services/game-service" "Game Service"
update_env_file "$BASE_DIR/services/match-service" "Match Service"
update_env_file "$BASE_DIR/services/user-service" "User Service"

# Configuració especial per al frontend amb variables VITE_
echo -e "Configurant ${BLUE}Frontend${NC}..."
frontend_env_file="$BASE_DIR/frontend/.env_host_ip"
cat > "$frontend_env_file" << ENVEOF
# Fitxer generat automàticament per setup_host_ip.sh
# No modifiquis aquest fitxer directament

HOST_IP=$HOST_IP
FRONTEND_URL=https://$HOST_IP:3000
JWT_SECRET=ft_transcendence_jwt_secret_keep_secure
# Variables específiques pel frontend
VITE_HOST_IP=$HOST_IP
VITE_API_URL=https://$HOST_IP:3000/api
ENVEOF
echo -e "${GREEN}✓${NC} Fitxer .env_host_ip creat per a Frontend"

# També actualitzem el fitxer .env del frontend (que Vite utilitza prioritàriament)
frontend_env_standard="$BASE_DIR/frontend/.env"
cat > "$frontend_env_standard" << ENVEOF
# Fitxer generat automàticament per setup_host_ip.sh
# Aquest fitxer és carregat automàticament per Vite

VITE_HOST_IP=$HOST_IP
VITE_API_URL=https://$HOST_IP:3000/api
ENVEOF
echo -e "${GREEN}✓${NC} Fitxer .env estàndard creat per a Frontend"

echo -e "\n${GREEN}Configuració completada!${NC}"
echo -e "La teva aplicació ara es pot accedir a través de: ${GREEN}https://$HOST_IP:3000${NC}"
echo -e "Si vols aplicar aquests canvis als serveis en execució, executa: ${BLUE}make restart-services${NC}"
