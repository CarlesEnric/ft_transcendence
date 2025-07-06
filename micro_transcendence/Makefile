# Fitxer de docker-compose principal
DC_FILE=docker-compose.yml

# Colors per a la terminal
RED=\033[1;31m
GREEN=\033[1;32m
YELLOW=\033[1;33m
BLUE=\033[1;34m
MAGENTA=\033[1;35m
CYAN=\033[1;36m
RESET=\033[0m

# Regla principal per a executar totes les accions
all: up

# Arrenca serveis en mode desatès amb reconstrucció
up:
	docker compose -f $(DC_FILE) up --build -d
	@echo "${GREEN}🍀 Services started successfully!${RESET}"
	@echo "${CYAN}🌐 Access at: ${GREEN}https://localhost:8000${RESET}"

# Atura els serveis (contenidors actius)
stop:
	docker compose -f $(DC_FILE) stop
	@echo "${YELLOW}🛑  Services stopped${RESET}"

# Elimina contenidors creats per docker-compose
down:
	docker compose -f $(DC_FILE) down --remove-orphans
	@echo "${RED}🗑️  Containers removed${RESET}"

# Reinicia els serveis
restart:
	$(MAKE) down
	$(MAKE) up

# Mostra l'estat dels serveis
ps:
	docker compose -f $(DC_FILE) ps

# Mostra els logs en viu
logs:
	@echo "${BLUE}📋 Showing logs (Ctrl+C to exit):${RESET}"
	docker compose -f $(DC_FILE) logs -f

# Reconstrueix les imatges
rebuild:
	docker compose -f $(DC_FILE) build
	@echo "${YELLOW}📑 Images rebuilt${RESET}"

# Neteja contenidors, volums i sistemes orfes
clean:
	docker compose -f $(DC_FILE) down -v --remove-orphans
	docker system prune -f
	@echo "${MAGENTA}🧼 Cleanup complete${RESET}"

# Neteja completa (volums, imatges, contenidors, xarxes)
fclean:
	docker compose -f $(DC_FILE) down --volumes --rmi all --remove-orphans
	docker system prune -a --volumes -f
	@echo "${RED}🧽 Full Docker cleanup complete${RESET}"

# Neteja de recursos no utilitzats
prune:
	docker system prune -a --volumes -f
	@echo "${BLUE}🚽 Docker system pruned${RESET}"

# Reexecuta (neteja i torna a pujar)
re: down all

# Regles per a la neteja de recursos
.PHONY: all up down stop restart logs ps rebuild clean fclean prune re
