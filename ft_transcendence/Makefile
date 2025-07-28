# ft_transcendence - Makefile
NAME = ft_transcendence
COMPOSE = docker-compose

.PHONY: all up down re clean fclean logs ps help

all: up

up:
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down

re: down up

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
	$(COMPOSE) exec -it api-gateway sh

exec-auth:
	$(COMPOSE) exec -it auth-service sh

exec-backend:
	$(COMPOSE) exec -it backend-service sh

exec-frontend:
	$(COMPOSE) exec -it frontend-service sh

exec-game:
	$(COMPOSE) exec -it game-service sh


help:
	@echo "$(NAME) - Comandes disponibles:"
	@echo ""
	@echo "  make up      - Up all services"
	@echo "  make down    - Stop all services"
	@echo "  make re      - Reset all services"
	@echo "  make clean   - Clean (containers and volumes)"
	@echo "  make fclean  - Clean (all)"
	@echo "  make logs    - See logs in real time"
	@echo "  make ps      - State of the containers"
	@echo ""
	@echo "  make exec-api       - Execute bash in api-gateway"
	@echo "  make exec-auth      - Execute bash in auth-service"
	@echo "  make exec-backend   - Execute bash in backend-service"
	@echo "  make exec-frontend  - Execute bash in frontend-service"
	@echo "  make exec-game      - Execute bash in game-service"

