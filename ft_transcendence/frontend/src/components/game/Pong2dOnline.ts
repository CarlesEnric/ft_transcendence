import { API_CONFIG } from '../../config/api';
import { getState, clearGameSession } from '../../core/state';
import { resetOnlineGameFlag, updateExitButtonState } from './GameRoom';
import { destroyRoomView } from '../../core/roomView';
import { navigateTo } from '../../core/router';

//  MILLORA: Variable global per idempotència de resultats
let __finishPostedKeyOnline: string | null = null;

//  MILLORA: Funció helper per crear clau única del resultat
function finishKey(code: string, s1: number, s2: number, winnerUserId: number) {
  return `${code}|${s1}|${s2}|${winnerUserId}`;
}

//  MILLORA: Funció robusta per enviar resultats al match-service
async function postFinishFromPongOnline(msg: { 
  player1Score: number; 
  player2Score: number; 
  winnerSide: 'left' | 'right' 
}): Promise<void> {
  try {
    const st: any = getState();
    const code: string | undefined = st?.match?.roomCode;
    const p1 = st?.players?.player1;
    const p2 = st?.players?.player2;
    
    if (!code || !p1?.id || !p2?.id) {
      console.warn('[RESULT][ONLINE] Falta info para postear', { code, p1, p2 });
      return;
    }
    
    // Només player1 envia resultats per evitar duplicats
    const iAmPlayer1 = p1?.id === st?.user?.id;
    if (!iAmPlayer1) {
      return;
    }
    
    const score1 = Number(msg.player1Score);
    const score2 = Number(msg.player2Score);
    const winnerUserId = msg.winnerSide === 'left' ? Number(p1.id) : Number(p2.id);
    const key = finishKey(code, score1, score2, winnerUserId);
    
    // Idempotència local
    if (__finishPostedKeyOnline === key) {
      return;
    }
    
    
    const res = await fetch('/api/matches/rooms/finish', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': `finish-${key}`,
      },
      body: JSON.stringify({ code, score1, score2, winnerUserId }),
    });
    
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.warn('[RESULT][ONLINE] POST falló:', res.status, txt);
      return;
    }
    
    __finishPostedKeyOnline = key;
    
  } catch (err) {
    console.warn('[RESULT][ONLINE] Error al postear resultado:', err);
  }
}

//  VARIABLES GLOBALS PER A KEYBOARD CONTROLS
let __onlineMyRole: 'left' | 'right' | null = null;
let __gameStarted = false;
let __onlineSocket: WebSocket | null = null;
let __onlineRoomCode: string | null = null;
let __onlineUserId: string | null = null;
let __keyboardListenersRegistered = false;

export function initPong2dOnline(
  canvas: HTMLCanvasElement,
  onScoreUpdate?: (p1: number, p2: number) => void
): void {
  if (!canvas) {
    console.error('[PongOnline] Canvas NO existeix!');
    return;
  }
  
  //  CRITICAL: Register keyboard listeners ONCE when module loads
  registerKeyboardListeners();
  
  // IMPORTANTE: Para Pong Online, necesitamos mantener dimensiones fijas
  // porque el backend envía coordenadas basadas en 800x600
  // Solo aplicamos el sistema responsive para CSS, pero mantenemos dimensiones internas fijas
  canvas.width = 800;
  canvas.height = 600;
  
  const ctx = canvas.getContext('2d')!;
  const state = getState() as any; // Agafem l'estat global original de l'aplicació en l'arxiu state.ts
  const roomCode = state?.match?.roomCode; // Obtenir el codi de la sala des de l'estat global  
  const userId = state?.user?.id; // Obtenir l'ID de l'usuari des de l'estat global
  const wsUrlBase = (window as any).app?.wsUrl ?? API_CONFIG.GAME.WS;
  
  // ROLE ASSIGNMENT: El backend assignarà el rol automàticament
  let myRole: 'left' | 'right' | null = null; // No assignem role inicialment
  
  
  // ADDED: Debug de role assignment
  const players = state?.players;
  
  // ROLE ASSIGNMENT: El backend assignarà el rol automàticament

  if (!roomCode || !userId) {
    console.error('[PongOnline] ERROR: roomCode o userId estan buits!', { roomCode, userId });
    return;
  }

// ADDED (helper para montar la URL con ?room=&userId=)
function buildWsUrl(base: string, params: Record<string, string>) {
  const u = new URL(base, base.startsWith('ws') ? undefined : (location.origin.replace(/^http/, 'ws')));
  Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
  return u.toString();
}


// ADDED (variables de control)
  let socket: WebSocket | null = null; // WebSocket per a comunicació en temps real 
  let gameStarted = false; // Estat del joc inicialment no ha començat
  let gameState: any = null; // Estat del joc sincronitzat
  let reconnectAttempts = 0;
  const MAX_RECONNECT = 5
  
  //  CRITICAL: Register keyboard listeners ONCE when module loads
  function registerKeyboardListeners() {
    if (__keyboardListenersRegistered) {
      return;
    }
    
    
    window.addEventListener('keydown', (e) => {
      if (!__gameStarted) {
        return;
      }
      
      if (!__onlineMyRole) {
        return;
      }

      // Only respond to WASD and Arrow keys
      const key = e.key.toLowerCase();
      if (!['w', 's', 'arrowup', 'arrowdown'].includes(key)) return;
      
      e.preventDefault();
      
      const direction = (key === 'w' || key === 'arrowup') ? 'up' : 'down';      
      if (!__onlineSocket || __onlineSocket.readyState !== WebSocket.OPEN) {        return;
      }
      
      if (!__onlineMyRole) {
        return;
      }

      // Validació de direcció
      if (direction !== 'up' && direction !== 'down') {
        console.warn('[FRONTEND] 🔴 Invalid direction:', direction);
        return;
      }      __onlineSocket.send(JSON.stringify({ 
        type: 'move', 
        direction: direction,
        room: __onlineRoomCode, 
        userId: __onlineUserId 
      }));
    });
    
    window.addEventListener('keyup', (e) => {
      if (!__gameStarted || !__onlineSocket) return;
      const key = e.key.toLowerCase();
      if (!['w', 's', 'arrowup', 'arrowdown'].includes(key)) return;
    });
    
    __keyboardListenersRegistered = true;
  }

  function connect(roomCode?: string, userId?: string) {
    //  DETERMINAR PLAYER ROLE BASANT-SE EN LA POSICIÓ A L'ESTAT
    const currentState = getState() as any;
    const players = currentState?.players;
    const myUserId = currentState?.user?.id;
    
    let playerRole: 'player1' | 'player2' | undefined = undefined;
    if (players?.player1?.id === myUserId) {
      playerRole = 'player1';
    } else if (players?.player2?.id === myUserId) {
      playerRole = 'player2';
    } else {
    }

    const urlParams: Record<string, string> = {
      room: String(roomCode ?? ''),
      userId: String(userId ?? '')
    };
    
    if (playerRole) {
      urlParams.playerRole = playerRole;
    }
    
    const url = buildWsUrl(wsUrlBase, urlParams);

  socket = new WebSocket(url);

  socket.onopen = () => {
    reconnectAttempts = 0;
    // Enviem join primer
    socket?.send(JSON.stringify({ type: 'join', room: roomCode, userId }));
    // Esperem un moment abans d'enviar ready per assegurar-nos que el backend processa join primer
    // Afegim una petita variació aleatòria per evitar que tots dos jugadors enviin ready exactament al mateix temps
    const readyDelay = 100 + Math.random() * 50; // 100-150ms random delay
    setTimeout(() => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'ready', room: roomCode, userId }));
      }
    }, readyDelay);
  };

  socket.onmessage = async (event) => {
    
    let messageText: string;
    
    // Handle different data types (Blob, ArrayBuffer, or string)
    if (event.data instanceof Blob) {
      messageText = await event.data.text();
    } else if (event.data instanceof ArrayBuffer) {
      messageText = new TextDecoder().decode(event.data);
    } else {
      messageText = event.data;
    }
    
    let msg: any;
    try { 
      msg = JSON.parse(messageText); 
    } catch (e) { 
      console.warn('[FRONTEND] Failed to parse message as JSON:', messageText);
      return; 
    }
    
    
    // Manegem els diferents tipus de missatges
    switch (msg.type) {
      case 'role_assigned':
        myRole = msg.role;
        __onlineMyRole = msg.role; //  Sync with global
        break;
        
      case 'welcome':
      case 'joined':
      case 'readyConfirmed':
        break;
        
      case 'start':
      case 'game_start':
        
        //  BLOQUEAR BOTÓ EXIT QUAN COMENÇA EL JOC
        updateExitButtonState(true);
        
        gameStarted = true;
        __gameStarted = true; //  Sync with global
        
        if (msg.state) {
          gameState = msg.state;
        } else {
        }
        
        requestAnimationFrame(gameLoop);
        break;

      case 'sync':
      case 'game_state':
        // Quan rebem un missatge de sincronització, actualitzem l'estat i dibuixem
        if (msg.state) {
          // El backend ja envia el format correcte
          gameState = {
            ballX: msg.state.ballX ?? 400,
            ballY: msg.state.ballY ?? 300,
            ballRadius: msg.state.ballRadius ?? 10,
            leftPaddleY: msg.state.leftPaddleY ?? 250,
            rightPaddleY: msg.state.rightPaddleY ?? 250,
            paddleWidth: msg.state.paddleWidth ?? 10,
            paddleHeight: msg.state.paddleHeight ?? 80,
            player1Score: msg.state.player1Score ?? 0,
            player2Score: msg.state.player2Score ?? 0
          };
          
          if (onScoreUpdate && gameState.player1Score !== undefined && gameState.player2Score !== undefined) {
            onScoreUpdate(gameState.player1Score, gameState.player2Score);
          }
          if (!gameStarted) {
            gameStarted = true;
            requestAnimationFrame(gameLoop);
          }
        }
        break;

      case 'score':
        onScoreUpdate?.(msg.player1 ?? 0, msg.player2 ?? 0);
        break;

      case 'game_restart':
        gameStarted = false;
        
        //  MILLORA: Reset de la variable d'idempotència per permetre nou resultat
        __finishPostedKeyOnline = null;
        
        // IMPORTANTE: Reset del flag del joc online en GameRoom
        resetOnlineGameFlag();
        
        // Reset game state
        if (msg.state) {
          gameState = {
            ballX: msg.state.ballX ?? 400,
            ballY: msg.state.ballY ?? 300,
            ballRadius: msg.state.ballRadius ?? 10,
            leftPaddleY: msg.state.leftPaddleY ?? 250,
            rightPaddleY: msg.state.rightPaddleY ?? 250,
            paddleWidth: msg.state.paddleWidth ?? 10,
            paddleHeight: msg.state.paddleHeight ?? 80,
            player1Score: msg.state.player1Score ?? 0,
            player2Score: msg.state.player2Score ?? 0
          };
          
          // Update score display
          if (onScoreUpdate) {
            onScoreUpdate(gameState.player1Score, gameState.player2Score);
          }
        }
        
        
        // Automatically send ready message when restart is confirmed
        if (socket && socket.readyState === WebSocket.OPEN) {
          const readyMessage = { type: 'ready', room: roomCode, userId };
          socket.send(JSON.stringify(readyMessage));
        } else {
          console.error('[FRONTEND]  Cannot send auto-ready: socket not open. ReadyState:', socket?.readyState);
        }
        break;


      case 'end':
      case 'game_end':
        gameStarted = false;
        

        // Actualitzar score final primer
        if (msg.state && msg.state.score && onScoreUpdate) {
          onScoreUpdate(msg.state.score.left, msg.state.score.right);
        }

        // Enviar resultats al match-service amb la funció robusta
        if (msg.state && msg.state.score) {
          const s1 = Number(msg.state.score.left || 0);
          const s2 = Number(msg.state.score.right || 0);
          const winnerSide: 'left' | 'right' = msg.winner === 'right' ? 'right' : 'left';
          postFinishFromPongOnline({ player1Score: s1, player2Score: s2, winnerSide }).catch(err => {
            console.warn('[FRONTEND] Failed to post result:', err);
          });
        }

        // RESETAR EL FLAG DEL JOC ONLINE per permetre restart
        resetOnlineGameFlag();

        // HABILITAR BOTÓ EXIT QUAN ACABA EL JOC
        updateExitButtonState(false);

        // NO ELIMINAR LA SESSIÓ AUTOMÀTICAMENT - deixar que l'usuari decideixi
        // clearGameSession(); // Comentat per permetre restart

        // NO NAVEGAR AUTOMÀTICAMENT - deixar que l'usuari faci restart o surti manualment
        break;
        //  HABILITAR BOTÓ EXIT QUAN LA SALA ES DESTRUEIX
        updateExitButtonState(false);
        
        // La sala s'ha esborrat perquè l'altre jugador ha marxat
        let departureMessage = '';
        if (msg.reason === 'player_left') {
          departureMessage = ' The other player left the room cowardly! Room deleted. Returning to dashboard...';
        } else {
          departureMessage = ' Room has been deleted. Returning to dashboard...';
        }
        
        
        //  TANCAR CONNEXIÓ SSE QUAN LA SALA ES DESTRUEIX
        destroyRoomView();
        
        // Tornar al dashboard després d'un petit retard (menys temps que abans)
        setTimeout(() => {
          navigateTo('/dashboard');
        }, 3000); // 3 segons
        break;

      default:
        break;
    }
    
    // Debug info per veure l'estat
    if (msg.state !== undefined) {
    } else {
    }
};

  socket.onclose = (event) => {
    console.warn('[WS] closed - Code:', event.code, 'Reason:', event.reason, 'WasClean:', event.wasClean);
    socket = null;
    
    // NOVA LÒGICA: Si la connexió es tanca inesperadament (no cleanly), és probable que la sala s'hagi esborrat
    // Això passa quan l'altre jugador surt i la sala es neteja automàticament
    if (!event.wasClean && event.code !== 1000) {
      
      // Mostrar missatge amb showToast i tornar al dashboard
      
      setTimeout(() => {
        // Usar navegació SPA sempre
        navigateTo('/dashboard');
      }, 2000);
      return;
    }
    
    // Lògica original de reconnexió només per desconnexions normals
    if (reconnectAttempts < MAX_RECONNECT) {
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
      reconnectAttempts++;
      console.warn(`[WS] reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT})`);
      setTimeout(() => connect(roomCode, userId), delay);
    } else {
      console.error('[WS] Max reconnect attempts reached, giving up');
      // També enviar al dashboard si no es pot reconnectar
      setTimeout(() => {
        navigateTo('/dashboard');
      }, 1000);
    }
  };

  socket.onerror = (err) => {
    console.error('[WS] error:', err);
    console.error('[WS] WebSocket error details:', {
      url: url,
      readyState: socket?.readyState,
      roomCode: roomCode,
      userId: userId
    });
  };
}



    // Game loop: dibuixa l'estat sincronitzat
  function gameLoop() {
    
    if (!gameStarted) {
      return;
    }
    
    if (!gameState) {
      requestAnimationFrame(gameLoop); // Continua esperant
      return;
    }    
    // Neteja el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fons fosc
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Línia central
    ctx.strokeStyle = 'white';
    ctx.setLineDash([5, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    
    // Marcadors
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(String(gameState.player1Score ?? 0), canvas.width / 4, 30);
    ctx.fillText(String(gameState.player2Score ?? 0), (canvas.width / 4) * 3, 30);
    
    // Paleta esquerra
    ctx.fillStyle = '#38b2ac';
    ctx.fillRect(0, gameState.leftPaddleY ?? 0, gameState.paddleWidth ?? 10, gameState.paddleHeight ?? 80);
    
    // Paleta dreta
    ctx.fillRect(canvas.width - (gameState.paddleWidth ?? 10), gameState.rightPaddleY ?? 0, gameState.paddleWidth ?? 10, gameState.paddleHeight ?? 80);
    
    // Pilota
    ctx.beginPath();
    ctx.arc(gameState.ballX ?? canvas.width/2, gameState.ballY ?? canvas.height/2, gameState.ballRadius ?? 10, 0, Math.PI * 2);
    ctx.fillStyle = '#f6ad55';
    ctx.fill();
    
    // Continua el loop
    requestAnimationFrame(gameLoop);
  }



  // Controls: envia moviments al servidor
  
  if (roomCode && userId) {
    connect(roomCode, String(userId));
  } else {
    console.error('[PongOnline] Cannot connect: missing roomCode or userId');
  }
}

//  MILLORA: Funció per tancar connexió WebSocket de manera neta
export function stopPong2dOnline(): void {
  
  // Tancar WebSocket si existeix
  const ws = (window as any).gameWebSocket;
  if (ws) {
    ws.close();
    (window as any).gameWebSocket = null;
  }
  
  //  CRITICAL: Reset ALL global variables
  __onlineSocket = null;
  __onlineMyRole = null;
  __gameStarted = false;
  __onlineRoomCode = null;
  __onlineUserId = null;
  __finishPostedKeyOnline = null;
  __keyboardListenersRegistered = false;
  
}

//  HANDLER: Process WebSocket messages from GameRoom's socket
export function handleGameWebSocketMessage(message: any): void {
  if (!message) return;
  
  // Only handle critical messages that Pong2dOnline needs
  switch (message.type) {
    case 'role_assigned':
      __onlineMyRole = message.role;
      break;
    
    case 'game_start':
    case 'start':
      __gameStarted = true;
      break;
    
    case 'game_end':
      __gameStarted = false;
      break;
  }
}