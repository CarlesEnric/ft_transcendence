# ft_transcendence - Guia de Bases de Dades

## Filosofia Simple
Cada microservei té la seva pròpia base de dades SQLite independent. Punt.

## Estructura
```
services/
├── auth-service/users_auth.db           # Usuaris i autenticació
├── user-service/users_profiles.db       # Perfils i amics
├── game-service/games_state.db          # Partides actives
├── match-service/matches_history.db     # Historial i estadístiques  
```

## Regles Simples

### 1. Cada servei gestiona NOMÉS la seva BD
- ❌ No accedeixis directament a BDs d'altres serveis
- ✅ Usa APIs per comunicar-te entre serveis

### 2. Identificadors consistents
- Tots els serveis usen `user_id` per referenciar usuaris
- Format: INTEGER PRIMARY KEY AUTOINCREMENT

### 3. Comunicació entre serveis
```typescript
// ❌ MAL: Accés directe a altra BD
const userDB = sqlite3('user-service/users_profiles.db');

// ✅ BÉ: Crida API
const userProfile = await fetch('http://user-service/profile/123');
```

## Templates per cada servei

### Auth Service (fet ✅)
```sql
CREATE TABLE users (id, username, email, password_hash, ...);
CREATE TABLE sessions (id, user_id, token, expires_at, ...);
```

### User Service
```sql
CREATE TABLE profiles (user_id, display_name, avatar_url, ...);
CREATE TABLE friendships (requester_id, addressee_id, status, ...);
```

### Game Service  
```sql
CREATE TABLE games (id, host_player_id, guest_player_id, status, ...);
CREATE TABLE game_state (game_id, ball_x, ball_y, player1_score, ...);
```

### Match Service
```sql
CREATE TABLE matches (id, player1_id, player2_id, winner_id, ...);
CREATE TABLE player_stats (user_id, wins, losses, ranking_points, ...);
```

## Quick Start per cada desenvolupador

1. **Copia el patró del auth-service** que ja està fet
2. **Adapta les taules** a les teves necessitats  
3. **Implementa operacions CRUD** bàsiques
4. **Crea APIs** per que altres serveis puguin accedir
5. **Prova** que funciona

## Exemple d'implementació

```typescript
// src/database/index.ts (template)
export class Database {
  private db: sqlite3.Database;

  constructor(dbPath: string) {
    this.db = new sqlite3.Database(dbPath);
    this.initialize();
  }

  private initialize(): void {
    // Crear taules aquí
    const createMyTable = `CREATE TABLE IF NOT EXISTS ...`;
    this.db.run(createMyTable);
  }

  // Operacions CRUD...
}
```

## Això és tot! 
Mantén-ho simple, mantén-ho funcional. Cada servei és independent i es comunica via APIs.
