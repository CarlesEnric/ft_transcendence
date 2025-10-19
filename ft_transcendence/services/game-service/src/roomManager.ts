// roomManager.ts - Gestió de sales i estat de joc Pong Online
import { GameState, GameMessage } from './types/game';

interface Player {
  userId: string;
  ws: any; // WebSocket
  role: 'left' | 'right';
}

interface GameRoom {
  roomCode: string;
  players: { [userId: string]: Player };
  ready: { [userId: string]: boolean };
  restartRequests: { [userId: string]: boolean };
  started: boolean;
  state: GameState;
}

export const rooms: { [roomCode: string]: GameRoom } = {};

function initialGameState(): GameState {
  return {
    ball: { x: 400, y: 300, velocityX: 3, velocityY: 3, radius: 10 },
    paddles: { left: 250, right: 250, width: 10, height: 80 },
    score: { left: 0, right: 0 }
  };
}

export function createRoom(roomCode: string) {
  rooms[roomCode] = {
    roomCode,
    players: {},
    ready: {},
    restartRequests: {},
    started: false,
    state: initialGameState()
  };
}

export function joinRoom(roomCode: string, userId: string, ws: any, playerRole?: 'player1' | 'player2') {
  if (!rooms[roomCode]) {
    createRoom(roomCode);
  }
  
  const room = rooms[roomCode];
  
  // Si el jugador ja existeix, mantenir el seu rol actual
  if (room.players[userId]) {
    room.players[userId].ws = ws; // Update WebSocket connection
    return;
  }
  
  //  SINCRONITZAR AMB L'API DE SALES: player1 → left, player2 → right
  let assignedRole: 'left' | 'right';
  if (playerRole === 'player1') {
    assignedRole = 'left';
  } else if (playerRole === 'player2') {
    assignedRole = 'right';
  } else {
    // Fallback: assignar basant-se en ordre d'arribada si no es proporciona playerRole
    const existingPlayerCount = Object.keys(room.players).length;
    if (existingPlayerCount === 0) {
      assignedRole = 'left';
    } else if (existingPlayerCount === 1) {
      assignedRole = 'right';
    } else {
      return;
    }
  }
  
  room.players[userId] = { userId, ws, role: assignedRole };
  
  const playerCount = Object.keys(room.players).length;
  const playerList = Object.values(room.players).map(p => `${p.userId}(${p.role})`).join(', ');
  
  // Notificar el role assignat al jugador
  ws.send(JSON.stringify({
    type: 'role_assigned',
    role: assignedRole,
    userId: userId,
    room: roomCode
  }));
  
  if (playerCount === 2) {
  }
}

export function setReady(roomCode: string, userId: string) {
  
  if (!rooms[roomCode]) {
    return;
  }  
  //  DETECTAR SI ES POST-RESTART
  const wasAllFalse = Object.values(rooms[roomCode].ready).every(val => val === false);
  if (wasAllFalse) {
  }
  
  rooms[roomCode].ready[userId] = true;
  
  const readyCount = Object.keys(rooms[roomCode].ready).length;
  const readyList = Object.keys(rooms[roomCode].ready).join(', ');
  const totalPlayers = Object.keys(rooms[roomCode].players).length;
  
  if (Object.keys(rooms[roomCode].ready).length === 2 && !rooms[roomCode].started) {
    rooms[roomCode].started = true;
    
    const startMessage: GameMessage = {
      type: 'start',
      state: rooms[roomCode].state
    };
    
    broadcast(roomCode, startMessage);
    
  } else if (rooms[roomCode].started) {
  } else {
  }
}

export function handleMove(roomCode: string, userId: string, direction: 'up' | 'down') {
  const role = rooms[roomCode].players[userId].role;
  if (role === 'left') {
    rooms[roomCode].state.paddles.left += direction === 'up' ? -10 : 10;
  } else {
    rooms[roomCode].state.paddles.right += direction === 'up' ? -10 : 10;
  }
}

export function broadcast(roomCode: string, msg: GameMessage) {
  const room = rooms[roomCode];
  if (!room) {
    return;
  }
  
  const playerCount = Object.keys(room.players).length;
  
  const state = room.state;
  const frontendState = {
    ballX: state.ball.x,
    ballY: state.ball.y,
    ballRadius: state.ball.radius,
    leftPaddleY: state.paddles.left,
    rightPaddleY: state.paddles.right,
    paddleWidth: state.paddles.width,
    paddleHeight: state.paddles.height,
    player1Score: state.score.left,
    player2Score: state.score.right
  };
  
  const messageToSend = { ...msg, state: frontendState };
  
  Object.values(room.players).forEach(({ ws, userId }) => {
    if (!ws || typeof ws.send !== 'function') {
      return;
    }
    try {
      ws.send(JSON.stringify(messageToSend));
    } catch (error) {
    }
  });
  
}

export function updateGameState(state: GameState) {
  // Mou la pilota
  state.ball.x += state.ball.velocityX;
  state.ball.y += state.ball.velocityY;

  // Col·lisió amb la part superior/inferior (amb radi de pilota)
  if (state.ball.y - state.ball.radius < 0 || state.ball.y + state.ball.radius > 600) {
    state.ball.velocityY = -state.ball.velocityY;
    // Limita la pilota dins del camp
    state.ball.y = Math.max(state.ball.radius, Math.min(600 - state.ball.radius, state.ball.y));
  }

  // Col·lisió amb la pala esquerra (millor detecció)
  if (state.ball.x - state.ball.radius < state.paddles.width && 
      state.ball.y > state.paddles.left && 
      state.ball.y < state.paddles.left + state.paddles.height) {
    state.ball.velocityX = -state.ball.velocityX;
    // Afegir angle segons on pega la pilota a la pala
    const hitPos = (state.ball.y - state.paddles.left) / state.paddles.height - 0.5;
    state.ball.velocityY = hitPos * 10;
    state.ball.x = state.paddles.width + state.ball.radius;
  } else if (state.ball.x < 0) {
    // Gol per la dreta
    state.score.right += 1;
    // Reset ball
    state.ball.x = 400;
    state.ball.y = 300;
    state.ball.velocityX = 3;
    state.ball.velocityY = 3;
  }

  // Col·lisió amb la pala dreta (millor detecció)
  if (state.ball.x + state.ball.radius > 800 - state.paddles.width && 
      state.ball.y > state.paddles.right && 
      state.ball.y < state.paddles.right + state.paddles.height) {
    state.ball.velocityX = -state.ball.velocityX;
    // Afegir angle segons on pega la pilota a la pala
    const hitPos = (state.ball.y - state.paddles.right) / state.paddles.height - 0.5;
    state.ball.velocityY = hitPos * 10;
    state.ball.x = 800 - state.paddles.width - state.ball.radius;
  } else if (state.ball.x > 800) {
    // Gol per l'esquerra
    state.score.left += 1;
    // Reset ball
    state.ball.x = 400;
    state.ball.y = 300;
    state.ball.velocityX = -3;
    state.ball.velocityY = 3;
  }

  // Limita la posició de les pales
  state.paddles.left = Math.max(0, Math.min(600 - state.paddles.height, state.paddles.left));
  state.paddles.right = Math.max(0, Math.min(600 - state.paddles.height, state.paddles.right));
}

export function restartGame(roomCode: string, userId?: string) {
  const room = rooms[roomCode];
  if (!room) {
    return;
  }
  
  if (userId) {
    // Player is requesting restart
    room.restartRequests[userId] = true;
    
    const requestCount = Object.keys(room.restartRequests).length;
    const totalPlayers = Object.keys(room.players).length;
    
    
    if (requestCount < totalPlayers) {
      // Not all players have requested restart yet
      broadcast(roomCode, {
        type: 'restart_requested',
        userId: userId,
        pending: totalPlayers - requestCount
      });
      return;
    }
  }
  
  
  // Reset game state
  room.state = initialGameState();
  room.started = false;
  
  // Reset ready status
  Object.keys(room.ready).forEach(userId => {
    room.ready[userId] = false;
  });
  
  // Clear restart requests
  room.restartRequests = {};  
  // Broadcast restart message
  broadcast(roomCode, {
    type: 'game_restart',
    state: room.state
  });
  
  
}

export function getRoom(roomCode: string): GameRoom | undefined {
  return rooms[roomCode];
}

setInterval(() => {
  Object.keys(rooms).forEach(roomCode => {
    const room = rooms[roomCode];
    if (room.started) {
      updateGameState(room.state);
      
      // Verificar fi del joc (5 goals)
      if (room.state.score.left >= 5 || room.state.score.right >= 5) {
        const winner = room.state.score.left >= 5 ? 'left' : 'right';
        room.started = false;
        
        // Enviar game_end als jugadors
        broadcast(roomCode, { 
          type: 'game_end', 
          state: room.state,
          winner: winner
        });
        
        //  NO ELIMINAR LA SALA - mantenir-la per permetre restart
        
        return;
      }
      
      broadcast(roomCode, { type: 'sync', state: room.state });
    }
  });
}, 50);
