# Match Service

*[English](#english) | [Català](#català)*

---

## English

**Responsibility:** Match history and statistics

### Function
- Match history
- Player statistics
- Leaderboards
- Tournament management

### Endpoints
- GET `/history` - Match history
- GET `/stats/:userId` - Player statistics
- GET `/leaderboard` - Global leaderboard
- GET `/tournaments` - Tournament list

### Database
- SQLite: `matches_history.db`
- Tables: matches, player_stats, tournaments

### Technologies
- Fastify
- SQLite
- Cron jobs (for calculations)

---

## Català

**Responsabilitat:** Historial de partides i estadístiques

### Funció
- Historial de partides
- Estadístiques de jugadors
- Classificacions (leaderboard)
- Gestió de tournaments

### Endpoints
- GET `/history` - Historial de partides
- GET `/stats/:userId` - Estadístiques jugador
- GET `/leaderboard` - Classificació global
- GET `/tournaments` - Llista tournaments

### Base de dades
- SQLite: `matches_history.db`
- Taules: matches, player_stats, tournaments

### Tecnologies
- Fastify
- SQLite
- Cron jobs (per calculations)
