# Fitxer de docker-compose principal
DC_FILE=docker-compose.yml

# Arrenca serveis en mode desatès amb reconstrucció
all up:
	sudo docker compose -f $(DC_FILE) up --build -d > /dev/null 2>&1
	echo "\033[1;32m🍀 Services started successfully!\033[0m"
	echo "\033[1;36m🌐 Access at: \033[1mhttps://localhost:8000\033[0m"

# Atura els serveis (contenidors actius)
stop:
	sudo docker compose -f $(DC_FILE) stop > /dev/null 2>&1
	echo "\033[1;33m🛑  Services stopped\033[0m"

# Elimina contenidors creats per docker-compose
down:
	sudo docker compose -f $(DC_FILE) down --remove-orphans > /dev/null 2>&1
	echo "\033[1;31m🗑️  Containers removed\033[0m"

# Reinicia els serveis
restart:
	$(MAKE) down
	$(MAKE) up

# Mostra l'estat dels serveis
ps:
	sudo docker compose -f $(DC_FILE) ps

# Mostra els logs en viu
logs:
	echo "\033[1;34m📋 Showing logs (Ctrl+C to exit):\033[0m"
	sudo docker compose -f $(DC_FILE) logs -f

# Reconstrueix les imatges
rebuild:
	sudo docker compose -f $(DC_FILE) build
	echo "\033[1;33m📑 Images rebuilt\033[0m"

# Neteja contenidors, volums i sistemes orfes
clean:
	sudo docker compose -f $(DC_FILE) down -v --remove-orphans > /dev/null 2>&1
	sudo docker system prune -f > /dev/null 2>&1
	echo "\033[1;35m🧼 Cleanup complete\033[0m"

# Neteja completa (volums, imatges, contenidors, xarxes)
fclean:
	sudo docker compose -f $(DC_FILE) down --volumes --rmi all --remove-orphans > /dev/null 2>&1
	sudo docker system prune -a --volumes -f > /dev/null 2>&1
	echo "\033[1;31m🧽 Full Docker cleanup complete\033[0m"

# Neteja de recursos no utilitzats
prune:
	sudo docker system prune -a --volumes -f > /dev/null 2>&1
	echo "\033[1;34m🚽 Docker system pruned\033[0m"

# Reexecuta (neteja i torna a pujar)
re: down all

# Regles per a la neteja de recursos
.PHONY: all up down stop restart logs ps rebuild clean fclean prune re
