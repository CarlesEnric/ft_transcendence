# Docker Compose Commands and Guide


To start your services defined in the `docker-compose.yml` file, use:
```bash
docker-compose up
```


This command starts all services (containers) as defined in the `docker-compose.yml` file. It will also pull any images if they're not already available locally. If you want to run it in the background (detached mode), use the `-d` flag:
```bash
docker-compose up -d
```


To stop the services and containers started by `docker-compose up`, use:
```bash
docker-compose down
```
This command stops and removes all containers defined in the `docker-compose.yml` file. It also removes any networks created by the `docker-compose` process.


To stop the services but keep the containers and networks intact, use:
```bash
docker-compose stop
```
This command stops the containers without removing them. You can restart them later with `docker-compose start`.


To rebuild the containers before starting them (useful if you’ve made changes to Dockerfiles or the `docker-compose.yml`), use:
```bash
docker-compose up --build
```
This will force a rebuild of any containers before starting them.


To view the logs for all services in real-time:
```bash
docker-compose logs
```


To view logs for a specific service:
```bash
docker-compose logs <service_name>
```

To restart all running containers, use:
```bash
docker-compose restart
```


This command restarts all containers in the `docker-compose` project. You can also restart a specific service:
```bash
docker-compose restart <service_name>
```


To list the containers and services defined in the `docker-compose.yml` file, use:
```bash
docker-compose ps
```
This shows the status of all the containers and their respective service names.


To scale a service (run multiple instances of the same container), use:
```bash
docker-compose up --scale <service_name>=<number_of_instances>
```


For example, to scale the web service to 3 instances, use:
```bash
docker-compose up --scale web=3
```

To remove stopped services, networks, and volumes created by `docker-compose`, use:
```bash
docker-compose down --volumes
```
This will not only stop and remove the containers but also remove any associated volumes.


To force the removal of containers, even if they are running, use:
```bash
docker-compose rm -f
```


To bring the services up again after stopping them, use:
```bash
docker-compose start
```
This command will start all previously stopped services.


To view detailed stats on container usage (e.g., CPU, memory), use:
```bash
docker-compose stats
```


To run a one-off command in a container (without having to start the entire service), use:
```bash
docker-compose run <service_name> <command>
```


For example, to open a bash shell in the `web` service, use:
```bash
docker-compose run web bash
```


To remove unused images, containers, and volumes after running `docker-compose down`, use:
```bash
docker-compose down --rmi all --volumes
```
This removes all images created by the `docker-compose` process, as well as volumes.


For a quick cleanup of unused Docker Compose containers, networks, and images, use:
```bash
docker-compose prune
```
This removes all stopped containers, unused networks, and unused images associated with the services.


This is useful when you want to make sure all dependencies and build steps are re-executed, especially after changing package.json, Dockerfile, or other important files.
```bash
sudo docker compose build --no-cache
```
means:
- sudo: Run the command with administrator privileges (needed if your user is not in the docker group).
- docker compose: Use Docker Compose to manage multi-container Docker applications.
- build: Build the Docker images defined in your docker-compose.yml.
- --no-cache: Do not use any cached layers; force Docker to rebuild everything from scratch.


Remove volumes, images and networks
```bash
sudo docker compose down --volumes
sudo docker system prune -af
```


When service app is running try to saw what is created inside
```bash
sudo docker-compose exec app sh
ls -l /app
```


View logs when app is running
```bash
docker-compose logs -f ()
sudo docker exec -it name_container /bin/sh

```


How to view databasde
Open container:
```bash
docker compose exec -it name_container /bin/sh
```
Inside container:
```bash
sqlite3 /app/db/db.sqlite
```
Inside sqlite3:
```bash
SELECT name, email, password FROM users;
SELECT * FROM users;
```

Per fer una prova de si agafa registre o no des del host:
```bash
curl -k -X POST https://localhost:7001/register -H "Content-Type: application/json" -d '{"name":"Test","email":"test@prova.com","password":"123456"}'
```

Watch active ports
```bash
netstat -tulpn
```