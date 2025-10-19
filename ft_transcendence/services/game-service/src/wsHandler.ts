// wsHandler.ts - Handler WebSocket per Pong Online
import { joinRoom, setReady, handleMove, broadcast, getRoom, updateGameState, restartGame, rooms } from './roomManager.js';
import { GameMessage } from './types/game.js';
import { URL } from 'node:url';

export function setupWebSocketServer(socket: any, req: any, message?: any) {
  
  // Debug the WebSocket object
  
  if (!socket || typeof socket.send !== 'function') {
    return;
  }

  
  const ws = socket;  // Parseja roomCode, userId de la query (Fastify compatible)
  const urlString = req.raw?.url || req.url || '';
  const urlObj = new URL('ws://localhost' + urlString);
  const roomCode = urlObj.searchParams.get('room') ?? '';
  const userId = urlObj.searchParams.get('userId') ?? '';
  const playerRole = urlObj.searchParams.get('playerRole') as 'player1' | 'player2' | null;
  
  
  joinRoom(roomCode, userId, ws, playerRole || undefined);
  
  // Send welcome message
  const welcomeMsg = { 
    type: 'welcome', 
    room: roomCode, 
    userId: userId,
    message: 'Connected to game server'
  };
  ws.send(JSON.stringify(welcomeMsg));

    ws.on('message', (msg: string) => {
      const data: GameMessage = JSON.parse(msg);
      
      if (data.type === 'join') {
        const joinResponse = { type: 'joined', room: roomCode, userId: userId };
        ws.send(JSON.stringify(joinResponse));
      }
      if (data.type === 'ready') {
        const room = getRoom(roomCode);
        if (room) {        }
        setReady(roomCode, userId);
        const roomAfter = getRoom(roomCode);
        if (roomAfter) {        }
        const readyResponse = { type: 'readyConfirmed', room: roomCode, userId: userId };
        ws.send(JSON.stringify(readyResponse));
      }
      if (data.type === 'move' && data.direction) {
        handleMove(roomCode, userId, data.direction);
      }
      if (data.type === 'restart') {
        restartGame(roomCode, userId);
      }
      if (data.type === 'abandon') {
        const room = getRoom(roomCode);
        if (room && room.started) {
          // Si el joc està en marxa i un jugador abandona, l'altre guanya
          const remainingPlayerId = Object.keys(room.players).find(id => id !== userId);
          if (remainingPlayerId) {
            const remainingPlayer = room.players[remainingPlayerId];
            
            // Enviar victòria per abandó al jugador que queda
            const winMessage = {
              type: 'game_end',
              winner: remainingPlayer.role,
              reason: 'opponent_abandoned',
              state: room.state
            };
            remainingPlayer.ws.send(JSON.stringify(winMessage));
            
            // NO enviem missatge al jugador que abandona perquè el frontend ja ho mostra
          }
          
          // Aturar el joc i eliminar la sala després de l'abandó
          room.started = false;
          setTimeout(() => {
            delete rooms[roomCode];
          }, 1000); // Donar temps perquè els missatges arribin
        } else if (room) {
          // Si el joc no està actiu, eliminar la sala directament
          delete rooms[roomCode];
        }
      }
      if (data.type === 'gameUpdate') {
        ws.send(JSON.stringify({ type: 'gameUpdateReceived', room: roomCode, userId: userId }));
      }
    });

    ws.on('close', () => {
      // Elimina el jugador de la sala si cal
      const room = getRoom(roomCode);
      if (room) {
        // Si el joc estava en marxa i un jugador abandona, l'altre guanya
        if (room.started && Object.keys(room.players).length === 2) {
          const remainingPlayerId = Object.keys(room.players).find(id => id !== userId);
          if (remainingPlayerId) {
            const remainingPlayer = room.players[remainingPlayerId];
            
            // Enviar victòria per abandó
            const winMessage = {
              type: 'game_end',
              winner: remainingPlayer.role,
              reason: 'opponent_disconnected',
              state: room.state
            };
            remainingPlayer.ws.send(JSON.stringify(winMessage));
          }
          
          // Eliminar la sala després de la desconnexió
          setTimeout(() => {
            delete rooms[roomCode];
          }, 1000);
        } else if (!room.started && Object.keys(room.players).length === 2) {
          // Si el joc no està actiu però hi ha 2 jugadors, notificar que la sala s'esborra
          const remainingPlayerId = Object.keys(room.players).find(id => id !== userId);
          if (remainingPlayerId) {
            const remainingPlayer = room.players[remainingPlayerId];
            
            // Enviar notificació de sala eliminada
            const roomDeletedMessage = {
              type: 'room_deleted',
              reason: 'player_left',
              userId: userId
            };
            remainingPlayer.ws.send(JSON.stringify(roomDeletedMessage));
          }
          
          // Eliminar la sala immediatament si no està activa
          setTimeout(() => {
            delete rooms[roomCode];
          }, 500);
        }
        
        // Eliminar el jugador de la sala
        delete room.players[userId];
        delete room.ready[userId];
        const remainingPlayers = Object.keys(room.players).length;
        
        // Si la sala queda buida, elimina la sala immediatament
        if (remainingPlayers === 0) {
          delete rooms[roomCode];
        }
      }
    });
}

// Bucle de joc (cada 16ms)
setInterval(() => {
  // Itera per totes les sales
  for (const roomCode in rooms) {
    const room = rooms[roomCode];
    if (room && room.started) {
      updateGameState(room.state);
      broadcast(roomCode, {
        type: 'sync',
        state: room.state
      });
    }
  }
}, 16);
