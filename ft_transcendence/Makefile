# ft_transcendence - Makefile
NAME = ft_transcendence
COMPOSE = docker compose
# use command shell to execute bash and doble $$ for use inside Makefile
HOST_IP = $(shell hostname -I | awk '{print $$1}')

.PHONY: all up build start down restart re clean fclean logs ps \
		help build-no-cache exec-api exec-auth exec-backend exec-frontend exec-game \
		host-ip clean-host-ip update-env restart-services oauth-setup auto-setup

all: host-ip build

# Start services (without forcing rebuild)
start:
	$(COMPOSE) up -d

up: start

# Build and start (force rebuild)
build: host-ip
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down

# Restart without rebuilding
restart: down start

# Build without cache
build-no-cache:
	$(COMPOSE) build --no-cache
	$(COMPOSE) up -d

# Full rebuild (force rebuild)
re: fclean build

clean:
	$(COMPOSE) down -v
	docker system prune -f

fclean: clean
	$(COMPOSE) down -v --rmi all --remove-orphans
	docker system prune -af --volumes

fclean-frontend:
	$(COMPOSE) rm -svf frontend
	docker system prune -af trans_frontend-static
	$(COMPOSE) build --no-cache frontend
	$(COMPOSE) up -d frontend


logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

# Configure environment with host IP (Executes the script for advanced configuration)
host-ip:
	@echo "🔄 Configurant l'entorn amb HOST_IP: $(HOST_IP)"
	@bash ./setup_host_ip.sh


# Clean host IP environment files
clean-host-ip:
	@echo "🧹 Eliminant fitxers .env_host_ip..."
	@rm -f frontend/.env_host_ip
	@rm -f services/auth-service/.env_host_ip
	@rm -f services/game-service/.env_host_ip
	@rm -f services/match-service/.env_host_ip
	@rm -f services/user-service/.env_host_ip
	@rm -f services/api-gateway/.env_host_ip
	@echo "✅ Fitxers .env_host_ip eliminats"

# Update environment variables based on HOST_IP
update-env:
	@echo "🔄 Actualitzant variables d'entorn amb HOST_IP..."
	@bash ./setup_host_ip.sh

# Restart auth and api-gateway services
restart-services:
	@echo "🔄 Reiniciant serveis per aplicar els canvis d'entorn..."
	$(COMPOSE) restart api-gateway auth-service
	@echo "✅ Serveis reiniciats"

# Configuració completa: configura IP i reinicia serveis
oauth-setup:
	@echo "🚀 Configurant completament l'aplicació amb IP $(HOST_IP)..."
	@echo "1️⃣ Configurant entorn amb IP del host"
	@bash ./setup_host_ip.sh
	@echo "2️⃣ Reiniciant serveis per aplicar els canvis"
	@$(MAKE) restart-services
	@echo ""
	@echo "✅ Configuració completada!"
	@echo "🌐 Pots accedir a l'aplicació per:"
	@echo "   - https://$(HOST_IP):3000 (IP externa, des de qualsevol dispositiu)"
	@echo "   - https://localhost:3000 (localhost, només des d'aquest ordinador)"
	@echo ""
	@echo "⚠️ IMPORTANT: Recorda que a la consola de Google has de tenir registrat:"
	@echo "   - https://localhost:3000/api/auth/google/callback"

# Auto-setup: Configuració i desplegament complet amb un sol comando
auto-setup:
	@echo "🚀 Iniciant configuració automàtica completa..."
	@echo "1️⃣ Configurant entorn amb IP del host"
	@bash ./setup_host_ip.sh
	@echo "2️⃣ Construint i desplegant tots els serveis"
	@$(MAKE) build
	@echo ""
	@echo "✅ Configuració i desplegament completats!"
	@echo "🌐 Pots accedir a l'aplicació per:"
	@echo "   - https://$(HOST_IP):3000 (IP externa, des de qualsevol dispositiu)"
	@echo "   - https://localhost:3000 (localhost, només des d'aquest ordinador)"
	@echo ""
	@echo "⚠️ IMPORTANT: Recorda que a la consola de Google has de tenir registrat:"
	@echo "   - https://localhost:3000/api/auth/google/callback"


# Execute bash interactiu en cada contenidor
exec-api:
	$(COMPOSE) exec api-gateway sh

exec-auth:
	$(COMPOSE) exec auth-service sh

exec-backend:
	$(COMPOSE) exec backend sh

exec-frontend:
	$(COMPOSE) exec frontend sh

exec-game:
	$(COMPOSE) exec game-service sh


help:
	@echo "$(NAME) - Comandes disponibles:"
	@echo ""
	@echo "  make            - Build and start all services (default)"
	@echo "  make start      - Start services without rebuild"
	@echo "  make up         - Alias for start"
	@echo "  make build      - Build and start with forced rebuild"
	@echo "  make build-no-cache - Build without cache"
	@echo "  make down       - Stop all services"
	@echo "  make restart    - Stop and start services"
	@echo "  make re         - Full rebuild (clean + build)"
	@echo "  make clean      - Clean containers and volumes"
	@echo "  make fclean     - Full clean (all containers and images)"
	@echo "  make logs       - Show logs in real time"
	@echo "  make ps         - Show container status"
	@echo ""
	@echo "  make exec-api       - Execute shell in api-gateway"
	@echo "  make exec-auth      - Execute shell in auth-service"
	@echo "  make exec-backend   - Execute shell in backend"
	@echo "  make exec-frontend  - Execute shell in frontend"
	@echo "  make exec-game      - Execute shell in game-service"
	@echo ""
	@echo "  make host-ip       - Configure environment with host IP"
	@echo "  make oauth-setup   - Configure OAuth environment and restart services"
	@echo "  make auto-setup    - Complete setup: configure environment, build and deploy all services"

