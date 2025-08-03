# 🎮 Game Service - Motor de Jocs i WebSockets

## 📋 Visió General

El Game Service és el **microservei responsable de la lògica de jocs i comunicació en temps real** de ft_transcendence. Gestiona partides de Pong, WebSocket connections per multijugador, i en el futur implementarà gràfics 3D amb Babylon.js.

## 🏗️ Estat d'Implementació

### 🔨 **EN DESENVOLUPAMENT**
- **Servidor base**: Fastify amb SSL/HTTPS
- **JWT Integration**: Autenticació amb cookies
- **WebSocket setup**: Infraestructura base
- **Docker ready**: Containerització preparada

### 📋 **PER IMPLEMENTAR**
- **Pong Game Logic**: Motor de joc server-side
- **WebSocket real-time**: Comunicació multijugador
- **3D Graphics**: Babylon.js integration
- **Game State Management**: Sincronització clients
- **Tournament System**: Sistema de tornejos

## 🔧 Tecnologies

- **Fastify**: Framework web d'alt rendiment
- **WebSockets**: Comunicació temps real
- **Babylon.js** (future): Gràfics 3D avançats
- **JWT**: Autenticació via cookies
- **TypeScript**: Type safety
- **SSL/HTTPS**: Comunicació segura

## 📁 Estructura del Codi (Planificada)

```
services/game-service/
├── src/
│   ├── index.ts             # Entry point del servei
│   ├── server.ts            # Configuració servidor WebSocket
│   │
│   ├── game/
│   │   ├── pong/
│   │   │   ├── engine.ts    # Motor de física Pong
│   │   │   ├── player.ts    # Lògica jugador
│   │   │   └── ball.ts      # Física pilota
│   │   │
│   │   ├── ai/
│   │   │   └── opponent.ts  # Intel·ligència artificial
│   │   │
│   │   └── multiplayer/
│   │       ├── room.ts      # Sales de joc
│   │       └── matchmaking.ts # Sistema matchmaking
│   │
│   ├── websocket/
│   │   ├── handlers.ts      # Event handlers WebSocket
│   │   ├── rooms.ts         # Gestió sales
│   │   └── broadcast.ts     # Missatgeria temps real
│   │
│   ├── graphics/
│   │   ├── babylon/
│   │   │   ├── scene.ts     # Escena 3D
│   │   │   ├── camera.ts    # Configuració camera
│   │   │   └── lighting.ts  # Il·luminació
│   │   │
│   │   └── renderer.ts      # Render engine
│   │
│   └── routes/
│       ├── games.ts         # API endpoints jocs
│       ├── tournaments.ts   # API tornejos
│       └── health.ts        # Health checks
│
├── ssl/                     # Certificats SSL
└── Dockerfile              # Configuració Docker
```

## 🎮 Funcionalitats Planificades

### **1. Pong Classic 2D**
```typescript
// Game State
interface PongState {
  ball: {
    x: number, y: number,
    velocityX: number, velocityY: number
  },
  player1: { y: number, score: number },
  player2: { y: number, score: number },
  gameStatus: 'waiting' | 'playing' | 'paused' | 'finished'
}

// Server-side game loop
setInterval(() => {
  updatePhysics();
  detectCollisions();
  broadcastState();
}, 1000/60); // 60 FPS
```

### **2. WebSocket Real-time**
```typescript
// Client → Server events
socket.emit('player-move', { playerId, direction: 'up' });
socket.emit('join-game', { gameId });

// Server → Client events
socket.emit('game-state', pongState);
socket.emit('game-start', { gameId, players });
socket.emit('game-end', { winner, finalScore });
```

### **3. Pong 3D amb Babylon.js**
```typescript
// Escena 3D avançada
const scene = new BABYLON.Scene(engine);
const camera = new BABYLON.ArcRotateCamera("camera", 0, 0, 10, BABYLON.Vector3.Zero(), scene);

// Paddles 3D
const paddle1 = BABYLON.MeshBuilder.CreateBox("paddle1", {width: 0.2, height: 1, depth: 0.1}, scene);
const paddle2 = BABYLON.MeshBuilder.CreateBox("paddle2", {width: 0.2, height: 1, depth: 0.1}, scene);

// Ball 3D amb física
const ball = BABYLON.MeshBuilder.CreateSphere("ball", {diameter: 0.1}, scene);
ball.physicsImpostor = new BABYLON.PhysicsImpostor(ball, BABYLON.PhysicsImpostor.SphereImpostor);
```

### **4. Multijugador (3+ jugadors)**
```typescript
// Configuracions de joc
const gameTypes = {
  classic: { players: 2, field: 'rectangle' },
  triangle: { players: 3, field: 'triangle' },
  square: { players: 4, field: 'square' },
  hexagon: { players: 6, field: 'hexagon' }
};

// Cada jugador controla un costat
players.forEach((player, index) => {
  player.side = gameTypes[type].sides[index];
});
```

## 🔌 API Endpoints (Planificats)

### **Gestió de Jocs**
```typescript
POST   /games                    # Crear nova partida
GET    /games/:id               # Status partida
PUT    /games/:id/join          # Unir-se a partida
DELETE /games/:id/leave         # Abandonar partida
```

### **Configuració**
```typescript
GET    /games/types             # Tipus de joc disponibles
POST   /games/create-ai         # Partida vs IA
POST   /games/create-tournament # Crear torneig
```

### **WebSocket Endpoints**
```typescript
WS     /ws/game/:id             # Connexió partida específica
WS     /ws/lobby                # Lobby general
WS     /ws/tournament/:id       # Sala torneig
```

## ⚙️ Configuració Planificada

### **Variables d'Entorn**
```bash
# Server
GAME_SERVICE_PORT=3003
HOST=0.0.0.0

# Game Configuration
GAME_TICK_RATE=60
MAX_PLAYERS_PER_GAME=4
AI_DIFFICULTY_LEVELS=3

# WebSocket
WS_HEARTBEAT_INTERVAL=30000
WS_CONNECTION_TIMEOUT=60000

# 3D Graphics
BABYLON_ASSETS_PATH=./assets/3d/
ENABLE_3D_GRAPHICS=true

# SSL
SSL_CERT_PATH=./ssl/cert.pem
SSL_KEY_PATH=./ssl/key.pem
```

## 🤖 Intel·ligència Artificial

### **AI Opponent (Sense A*)**
```typescript
class PongAI {
  private difficulty: 'easy' | 'medium' | 'hard';
  private reactionTime: number; // Simula human reaction
  
  // Refresh cada segon (requisit del projecte)
  updateAI() {
    const ballPrediction = this.predictBallPosition();
    const targetY = this.calculateOptimalPosition(ballPrediction);
    
    // Simula input de teclat humà
    this.simulateKeyboardInput(targetY);
  }
  
  // Algoritmes alternatius a A*
  private predictBallPosition() {
    // Utilitza physics prediction
    // Càlcul de trajectòria amb rebounds
  }
}
```

## 🎯 Fases de Desenvolupament

### **Fase 1: Base Infrastructure** (Actual)
- ✅ Servidor Fastify amb SSL
- ✅ JWT authentication
- ✅ Docker setup

### **Fase 2: Pong 2D Basic**
- 🔨 Server-side game loop
- 🔨 WebSocket real-time
- 🔨 Basic multiplayer (2 players)

### **Fase 3: Multijugador Avançat**
- 📋 Support 3+ jugadors
- 📋 Diferents modalitats de joc
- 📋 Sistema de sales i matchmaking

### **Fase 4: 3D Graphics**
- 📋 Babylon.js integration
- 📋 Gràfics 3D immersivos
- 📋 Efectes visuals avançats

### **Fase 5: AI i Tornejos**
- 📋 Oponent IA intel·ligent
- 📋 Sistema de tornejos
- 📋 Power-ups i personalització

## 🚀 Execució

```bash
# Desenvolupament
npm run dev

# Build i start
npm run build
npm start

# Docker
docker build -t game-service .
docker run -p 3003:3003 game-service
```

---

**📡 Port intern**: 3003 (només accessible via API Gateway)  
**🎮 Responsabilitat**: Motor de jocs i real-time gameplay
