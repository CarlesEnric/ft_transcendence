#!/bin/bash
# Put on root of ft_transcendence project
source .env

DOMAIN_SHORT=${DUCKDNS_DOMAIN%%.duckdns.org} # sense .duckdns.org (talla part del domini)
IP=$(hostname -I | awk '{print $1}')
#IP=$(ipconfig getifaddr en0) # MacOS

curl -s "https://www.duckdns.org/update?domains=$DOMAIN_SHORT&token=$DUCKDNS_TOKEN&ip=$IP"
echo "[$(date)] IP $IP actualitzada a $DUCKDNS_DOMAIN"

# Exporta la variable a un fitxer temporal que després es pot llegir a docker-compose pels microserveis (faig realment ús?)
echo "DOMAIN=$DUCKDNS_DOMAIN" > .env_duckdns