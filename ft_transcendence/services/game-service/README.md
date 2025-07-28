# Game Service

*[English](#english) | [Català](#català)*

---

## English
 
**Responsibility:** Pong game logic and multiplayer

### Function
- Pong game logic
- Game physics (ball, paddles)
- WebSockets for multiplayer
- Game room management

### Endpoints
- POST `/create` - Create new game
- POST `/join/:id` - Join game
- GET `/list` - List available games
- WebSocket `/play/:id` - Play real-time

### Database
- SQLite: `games_state.db`
- Tables: games, game_events

### Technologies
- Fastify
- WebSockets (Socket.io)
- Babylon.js (3D graphics)
- SQLite
- crypto (secure room ID generation)

---

## Català
 
**Responsabilitat:** Lògica del joc Pong i multijugador

### Funció
- Lògica del joc Pong
- Física del joc (pilota, pales)
- WebSockets per multijugador
- Gestió de sales de joc

### Endpoints
- POST `/create` - Crear nova partida
- POST `/join/:id` - Unir-se a partida
- GET `/list` - Llista partides disponibles
- WebSocket `/play/:id` - Jugar en temps real

### Base de dades
- SQLite: `games_state.db`
- Taules: games, game_events

### Tecnologies
- Fastify
- WebSockets (Socket.io)
- Babylon.js (3D graphics)
- SQLite
- crypto (generació segura d'IDs de sala)
