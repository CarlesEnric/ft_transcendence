# 🎮 Game Service - Motor del Joc Pong

## 📋 Visió General

El Game Service gestiona la **lògica del joc Pong, WebSocket real-time, match-making i game state management**. És el cor del gameplay de ft_transcendence.

## 🏗️ Funcionalitats Planificades

### ⚠️ **PLACEHOLDER - CRITICAL FOR PROJECT**
- Motor de joc Pong en temps real
- WebSocket bi-directional communication
- Game state synchronization
- Player matching system
- Real-time physics calculation
- Score tracking i win conditions
- Reconnection handling

## 🔧 Tecnologies

- **Fastify**: Framework web amb WebSocket support
- **WebSockets**: Real-time bidirectional communication
- **SQLite**: Base de dades per active games
- **Canvas/HTML5**: Client-side rendering
- **Game Loop**: Server-authoritative game state
- **TypeScript**: Type safety per game logic

## 📁 Estructura Planificada

```
services/game-service/
├── src/
│   ├── index.ts              # Entry point
│   ├── game/
│   │   ├── engine.ts         # Core game engine
│   │   ├── physics.ts        # Physics calculations
│   │   ├── state.ts          # Game state management
│   │   └── constants.ts      # Game configuration
│   ├── matchmaking/
│   │   ├── queue.ts          # Player queue system
│   │   ├── matcher.ts        # Player matching logic
│   │   └── lobby.ts          # Pre-game lobby
│   ├── websocket/
│   │   ├── handlers.ts       # WebSocket event handlers
│   │   ├── messages.ts       # Message types
│   │   └── rooms.ts          # Game room management
│   ├── routes/
│   │   ├── games.ts          # Game management API
│   │   ├── lobby.ts          # Lobby endpoints
│   │   └── health.ts         # Health check
│   └── types/
│       ├── game.ts           # Game type definitions
│       └── player.ts         # Player interfaces
├── ssl/
├── Dockerfile
├── package.json
└── tsconfig.json
```

## 🎯 Core Game Logic

### **1. Pong Game Engine**
```typescript
// Game constants
export const GAME_CONFIG = {
  FIELD_WIDTH: 800,
  FIELD_HEIGHT: 400,
  PADDLE_WIDTH: 10,
  PADDLE_HEIGHT: 80,
  BALL_SIZE: 10,
  PADDLE_SPEED: 5,
  BALL_INITIAL_SPEED: 3,
  MAX_SCORE: 5,
  FPS: 60
};

// Game state interface
interface GameState {
  id: string;
  player1: Player;
  player2: Player;
  ball: Ball;
  score: { player1: number; player2: number };
  status: 'waiting' | 'playing' | 'paused' | 'finished';
  winner?: string;
  lastUpdate: number;
}

interface Ball {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  speed: number;
}

interface Player {
  id: string;
  username: string;
  paddle: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  connected: boolean;
}
```

### **2. Physics Engine**
```typescript
export class PongPhysics {
  static updateBall(ball: Ball, deltaTime: number): Ball {
    // Update ball position
    const newBall = { ...ball };
    newBall.x += ball.velocityX * ball.speed * deltaTime;
    newBall.y += ball.velocityY * ball.speed * deltaTime;
    
    // Wall collision (top/bottom)
    if (newBall.y <= 0 || newBall.y >= GAME_CONFIG.FIELD_HEIGHT - GAME_CONFIG.BALL_SIZE) {
      newBall.velocityY *= -1;
      newBall.y = Math.max(0, Math.min(GAME_CONFIG.FIELD_HEIGHT - GAME_CONFIG.BALL_SIZE, newBall.y));
    }
    
    return newBall;
  }
  
  static checkPaddleCollision(ball: Ball, paddle: Paddle): boolean {
    return (
      ball.x < paddle.x + paddle.width &&
      ball.x + GAME_CONFIG.BALL_SIZE > paddle.x &&
      ball.y < paddle.y + paddle.height &&
      ball.y + GAME_CONFIG.BALL_SIZE > paddle.y
    );
  }
  
  static checkScore(ball: Ball): 'player1' | 'player2' | null {
    if (ball.x < 0) return 'player2';
    if (ball.x > GAME_CONFIG.FIELD_WIDTH) return 'player1';
    return null;
  }
}
```

### **3. Game State Manager**
```typescript
export class GameStateManager {
  private games: Map<string, GameState> = new Map();
  
  createGame(player1Id: string, player2Id: string): string {
    const gameId = generateGameId();
    
    const gameState: GameState = {
      id: gameId,
      player1: {
        id: player1Id,
        username: '', // Fetch from user service
        paddle: {
          x: 20,
          y: GAME_CONFIG.FIELD_HEIGHT / 2 - GAME_CONFIG.PADDLE_HEIGHT / 2,
          width: GAME_CONFIG.PADDLE_WIDTH,
          height: GAME_CONFIG.PADDLE_HEIGHT
        },
        connected: true
      },
      player2: {
        id: player2Id,
        username: '', // Fetch from user service
        paddle: {
          x: GAME_CONFIG.FIELD_WIDTH - 30,
          y: GAME_CONFIG.FIELD_HEIGHT / 2 - GAME_CONFIG.PADDLE_HEIGHT / 2,
          width: GAME_CONFIG.PADDLE_WIDTH,
          height: GAME_CONFIG.PADDLE_HEIGHT
        },
        connected: true
      },
      ball: this.resetBall(),
      score: { player1: 0, player2: 0 },
      status: 'waiting',
      lastUpdate: Date.now()
    };
    
    this.games.set(gameId, gameState);
    return gameId;
  }
  
  updateGame(gameId: string): GameState | null {
    const game = this.games.get(gameId);
    if (!game || game.status !== 'playing') return null;
    
    const now = Date.now();
    const deltaTime = (now - game.lastUpdate) / 1000;
    
    // Update ball physics
    game.ball = PongPhysics.updateBall(game.ball, deltaTime);
    
    // Check paddle collisions
    if (PongPhysics.checkPaddleCollision(game.ball, game.player1.paddle)) {
      game.ball.velocityX = Math.abs(game.ball.velocityX);
      game.ball.speed *= 1.05; // Increase speed slightly
    }
    
    if (PongPhysics.checkPaddleCollision(game.ball, game.player2.paddle)) {
      game.ball.velocityX = -Math.abs(game.ball.velocityX);
      game.ball.speed *= 1.05;
    }
    
    // Check scoring
    const scorer = PongPhysics.checkScore(game.ball);
    if (scorer) {
      if (scorer === 'player1') game.score.player1++;
      else game.score.player2++;
      
      // Check win condition
      if (game.score.player1 >= GAME_CONFIG.MAX_SCORE || 
          game.score.player2 >= GAME_CONFIG.MAX_SCORE) {
        game.status = 'finished';
        game.winner = game.score.player1 > game.score.player2 ? game.player1.id : game.player2.id;
      } else {
        game.ball = this.resetBall();
      }
    }
    
    game.lastUpdate = now;
    return game;
  }
  
  private resetBall(): Ball {
    return {
      x: GAME_CONFIG.FIELD_WIDTH / 2,
      y: GAME_CONFIG.FIELD_HEIGHT / 2,
      velocityX: Math.random() > 0.5 ? 1 : -1,
      velocityY: (Math.random() - 0.5) * 2,
      speed: GAME_CONFIG.BALL_INITIAL_SPEED
    };
  }
}
```

## 🔌 WebSocket Implementation

### **1. WebSocket Event Handlers**
```typescript
export class GameWebSocketHandler {
  constructor(
    private gameStateManager: GameStateManager,
    private matchmaker: Matchmaker
  ) {}
  
  handleConnection(connection: WebSocket, userId: string) {
    console.log(`Player ${userId} connected`);
    
    connection.on('message', (data) => {
      const message = JSON.parse(data.toString());
      this.handleMessage(connection, userId, message);
    });
    
    connection.on('close', () => {
      this.handleDisconnection(userId);
    });
  }
  
  private handleMessage(connection: WebSocket, userId: string, message: any) {
    switch (message.type) {
      case 'join_queue':
        this.handleJoinQueue(connection, userId);
        break;
        
      case 'paddle_move':
        this.handlePaddleMove(userId, message.direction);
        break;
        
      case 'game_ready':
        this.handleGameReady(userId);
        break;
        
      case 'ping':
        connection.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        break;
    }
  }
  
  private handleJoinQueue(connection: WebSocket, userId: string) {
    this.matchmaker.addToQueue(userId, connection);
    
    // Try to find a match
    const match = this.matchmaker.findMatch();
    if (match) {
      const gameId = this.gameStateManager.createGame(match.player1, match.player2);
      
      // Notify both players
      match.connection1.send(JSON.stringify({
        type: 'game_found',
        gameId,
        opponent: match.player2
      }));
      
      match.connection2.send(JSON.stringify({
        type: 'game_found',
        gameId,
        opponent: match.player1
      }));
    }
  }
  
  private handlePaddleMove(userId: string, direction: 'up' | 'down') {
    // Find game for this player
    const game = this.findGameByPlayer(userId);
    if (!game || game.status !== 'playing') return;
    
    const player = game.player1.id === userId ? game.player1 : game.player2;
    
    // Update paddle position
    if (direction === 'up') {
      player.paddle.y = Math.max(0, player.paddle.y - GAME_CONFIG.PADDLE_SPEED);
    } else {
      player.paddle.y = Math.min(
        GAME_CONFIG.FIELD_HEIGHT - GAME_CONFIG.PADDLE_HEIGHT,
        player.paddle.y + GAME_CONFIG.PADDLE_SPEED
      );
    }
  }
}
```

### **2. Game Loop**
```typescript
export class GameLoop {
  private activeGames: Set<string> = new Set();
  private intervalId?: NodeJS.Timeout;
  
  constructor(
    private gameStateManager: GameStateManager,
    private webSocketManager: WebSocketManager
  ) {}
  
  start() {
    this.intervalId = setInterval(() => {
      this.tick();
    }, 1000 / GAME_CONFIG.FPS);
  }
  
  private tick() {
    for (const gameId of this.activeGames) {
      const gameState = this.gameStateManager.updateGame(gameId);
      
      if (gameState) {
        // Broadcast game state to all players
        this.webSocketManager.broadcastToGame(gameId, {
          type: 'game_state',
          state: gameState
        });
        
        // Check if game finished
        if (gameState.status === 'finished') {
          this.handleGameFinished(gameId, gameState);
        }
      }
    }
  }
  
  private handleGameFinished(gameId: string, gameState: GameState) {
    // Remove from active games
    this.activeGames.delete(gameId);
    
    // Send final results
    this.webSocketManager.broadcastToGame(gameId, {
      type: 'game_finished',
      winner: gameState.winner,
      finalScore: gameState.score
    });
    
    // TODO: Send results to match service
    this.sendMatchResults(gameState);
  }
  
  private async sendMatchResults(gameState: GameState) {
    const matchData = {
      player1Id: gameState.player1.id,
      player2Id: gameState.player2.id,
      winnerId: gameState.winner,
      finalScore: gameState.score,
      duration: Date.now() - gameState.lastUpdate, // Approximate
      gameType: 'pong'
    };
    
    // Send to match service
    await fetch(`${MATCH_SERVICE_URL}/matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(matchData)
    });
  }
}
```

## 🎯 Matchmaking System

### **1. Player Queue**
```typescript
interface QueuedPlayer {
  userId: string;
  connection: WebSocket;
  joinedAt: number;
  skillLevel?: number;
}

export class Matchmaker {
  private queue: QueuedPlayer[] = [];
  
  addToQueue(userId: string, connection: WebSocket) {
    // Remove if already in queue
    this.removeFromQueue(userId);
    
    this.queue.push({
      userId,
      connection,
      joinedAt: Date.now()
    });
    
    console.log(`Player ${userId} joined queue. Queue size: ${this.queue.length}`);
  }
  
  findMatch(): { player1: string; player2: string; connection1: WebSocket; connection2: WebSocket } | null {
    if (this.queue.length < 2) return null;
    
    // Simple FIFO matching for now
    const player1 = this.queue.shift()!;
    const player2 = this.queue.shift()!;
    
    return {
      player1: player1.userId,
      player2: player2.userId,
      connection1: player1.connection,
      connection2: player2.connection
    };
  }
  
  removeFromQueue(userId: string) {
    this.queue = this.queue.filter(p => p.userId !== userId);
  }
  
  getQueueSize(): number {
    return this.queue.length;
  }
}
```

## 🗄️ Database Schema

```sql
-- Active games tracking
CREATE TABLE active_games (
  id TEXT PRIMARY KEY,
  player1_id INTEGER NOT NULL,
  player2_id INTEGER NOT NULL,
  status TEXT NOT NULL, -- 'waiting', 'playing', 'paused', 'finished'
  score_player1 INTEGER DEFAULT 0,
  score_player2 INTEGER DEFAULT 0,
  winner_id INTEGER,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  finished_at DATETIME,
  game_state TEXT, -- JSON serialized game state
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Game events for replay/analysis
CREATE TABLE game_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'paddle_move', 'ball_hit', 'score', 'game_start', 'game_end'
  player_id INTEGER,
  event_data TEXT, -- JSON event details
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES active_games(id)
);
```

## 🚀 API Endpoints

### **Game Management**
```typescript
POST /games                    # Create new game
GET  /games/:gameId           # Get game state
PUT  /games/:gameId/join      # Join existing game
DELETE /games/:gameId         # Leave/forfeit game

GET  /queue                   # Queue status
POST /queue/join             # Join matchmaking
DELETE /queue/leave          # Leave queue

GET  /lobby                  # Active lobbies
POST /lobby                  # Create private lobby
```

### **WebSocket Endpoints**
```typescript
WS /ws/game                  # Main game WebSocket
WS /ws/spectate/:gameId      # Spectate game (future)
```

## 📊 Estat Actual

### ✅ **Infraestructura**
- Basic service structure
- SSL/HTTPS configuration
- Health check endpoint
- Docker configuration

### ⚠️ **CRÍTIC PER IMPLEMENTAR**
- Motor de joc Pong complet
- WebSocket real-time communication
- Matchmaking system
- Game state synchronization
- Physics engine
- Player input handling

### ❌ **Features Avançades**
- Spectator mode
- Game replay system
- Tournament integration
- Advanced matchmaking (skill-based)
- Custom game modes

## 🎯 Prioritats de Desenvolupament

### **Fase 1: Core Game (CRÍTICA)**
1. Implementar Pong physics engine
2. WebSocket bidirectional communication
3. Basic matchmaking (FIFO)
4. Real-time game state sync
5. Score tracking i win conditions

### **Fase 2: Polish & Stability**
1. Reconnection handling
2. Game pause/resume
3. Better error handling
4. Performance optimization

### **Fase 3: Advanced Features**
1. Skill-based matchmaking
2. Spectator mode
3. Game replay
4. Custom game settings

## 🔗 Integracions Necessàries

### **Auth Service**
- JWT token validation per WebSocket
- Player identity verification

### **User Service**
- Player profile information
- Online status integration
- Friend invitations

### **Match Service**
- Game results storage
- Statistics calculation
- Match history

### **Frontend**
- Canvas-based game rendering
- WebSocket client implementation
- Game UI/UX

## 📝 Notes Tècniques

- **Real-time Requirements**: 60 FPS game loop
- **WebSocket**: Bidirectional low-latency communication
- **Server Authoritative**: Game state managed server-side
- **Physics**: Deterministic calculations per consistency
- **Reconnection**: Handle temporary disconnections
- **Latency Compensation**: Client-side prediction (future)

**El Game Service és CRÍTICO per al projecte i necessita implementació completa.**
