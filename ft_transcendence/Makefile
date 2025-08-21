# ft_transcendence - Makefile
NAME = ft_transcendence
COMPOSE = docker compose

.PHONY: all up build start down restart re clean fclean logs ps help build-no-cache exec-api exec-auth exec-backend exec-frontend exec-game

all: build

# Start services (without forcing rebuild)
start:
	$(COMPOSE) up -d

up: start

# Build and start (force rebuild)
build:
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

fclean:
	$(COMPOSE) down -v --rmi all --remove-orphans
	docker system prune -af --volumes

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

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

