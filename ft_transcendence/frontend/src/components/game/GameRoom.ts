import { navigateTo } from '../../core/router';
import { getState, setPlayerReady, clearGameSession } from '../../core/state';
import { renderFooter, initFooter } from '../global/Footer';
import i18n from '../../core/i18n';
import { quickMatchOnce, markReady, leaveCurrentRoomSync, leaveCurrentRoom, joinSpecificRoom } from '../../core/matchmaking';
import { renderScoreboard } from './Scoreboard';
import { renderPlayerCard } from './PlayerCard';
import { renderPongCanvas } from './PongCanvas';
import { initPong2dIA, stopPong2dIA } from './Pong2dIA';
import { renderPong2dInline } from './Pong2dInline';
import { initPong2dOnline, stopPong2dOnline, handleGameWebSocketMessage } from './Pong2dOnline';
import { createResponsivePongCanvas } from './pongCanvasUtils';
import { API_CONFIG } from '../../config/api';
import { initRoomView, destroyRoomView } from '../../core/roomView';
import { showGameEndedButtons } from './GameEndedButtons';
import { createScoreUpdater } from './ScoreUpdater';
import { renderGameHeader, renderGameLayout, renderGameContainer } from './GameLayouts';

const GOALS_TO_WIN = 5;

const checkIfGameEnded = (): boolean => {
  const player1Score = parseInt(document.getElementById('player1Score')?.textContent || '0', 10);
  const player2Score = parseInt(document.getElementById('player2Score')?.textContent || '0', 10);
  return player1Score >= GOALS_TO_WIN || player2Score >= GOALS_TO_WIN;
};

let __finishPostedKey: string | null = null;

function amIPlayer1Strict(): boolean {
  const st: any = getState();
  return st?.match?.role === 'player1';
}

function currentRoomCode(): string | null {
  const st: any = getState();
  return st?.match?.roomCode || null;
}

function currentPlayers() {
  const st: any = getState();
  return {
    p1: st?.players?.player1 ?? null,
    p2: st?.players?.player2 ?? null,
  };
}

function finishKey(code: string, s1: number, s2: number, winnerUserId: number) {
  return `${code}|${s1}|${s2}|${winnerUserId}`;
}

async function postFinishFromGameEnd(msg: {
  state: { player1Score: number; player2Score: number };
  winner: 'left' | 'right';
}): Promise<void> {
  try {
    const code = currentRoomCode();
    if (!code) {
      console.warn('[RESULT] No roomCode en state, no se reporta.');
      return;
    }
    if (!amIPlayer1Strict()) {
      return;
    }
    const { p1, p2 } = currentPlayers();
    if (!p1?.id || !p2?.id) {
      console.warn('[RESULT] Falta info de players en state; no reporto (aún).', { p1, p2 });
      return;
    }
    const score1 = Number(msg.state.player1Score);
    const score2 = Number(msg.state.player2Score);
    const winnerUserId = msg.winner === 'left' ? Number(p1.id) : Number(p2.id);
    const key = finishKey(code, score1, score2, winnerUserId);
    if (__finishPostedKey === key) {
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
      console.warn('[RESULT] finishRoom falló:', res.status, txt);
      return;
    }
    __finishPostedKey = key;
  } catch (err) {
    console.warn('[RESULT] Error al postear resultado:', err);
  }
}

const getWinner = (): 'player1' | 'player2' | null => {
  const player1Score = parseInt(document.getElementById('player1Score')?.textContent || '0', 10);
  const player2Score = parseInt(document.getElementById('player2Score')?.textContent || '0', 10);
  
  if (player1Score >= GOALS_TO_WIN) return 'player1';
  if (player2Score >= GOALS_TO_WIN) return 'player2';
  return null;
};

function applyScoreboardNames() {
  const mode = window.app?.getGameMode?.() || 'ai';
  const leftEl = document.getElementById('scoreNameLeft');
  const rightEl = document.getElementById('scoreNameRight');
  
  if (mode === 'ai') {
    // Mode IA: User vs AI
    const { user } = getState() as any;
    const leftName = user?.username || 'Player';
    const rightName = 'AI';
    if (leftEl) { leftEl.textContent = leftName; leftEl.setAttribute('title', leftName); }
    if (rightEl) { rightEl.textContent = rightName; rightEl.setAttribute('title', rightName); }
  } else {
    // Mode Online/PvP: Player1 vs Player2
    const { players } = getState() as any;
    const leftName = players?.player1?.username || i18n.t('game.waiting.player1', 'Waiting');
    const rightName = players?.player2?.username || i18n.t('game.waiting.player2', 'Waiting');
    if (leftEl) { leftEl.textContent = leftName; leftEl.setAttribute('title', leftName); }
    if (rightEl) { rightEl.textContent = rightName; rightEl.setAttribute('title', rightName); }
  }
}

function refreshPlayerCards() {
  const currentState = getState() as any;
  
  document
    .querySelectorAll<HTMLElement>('[data-player-card="player1"], [data-player-card="player2"]')
    .forEach((el) => {
      const role = el.getAttribute('data-player-card') as 'player1' | 'player2';
      const compact = !!el.closest('.lg\\:hidden');
      el.outerHTML = renderPlayerCard({ type: role, compact });
    });
  setTimeout(bindReadyButtons, 0);
}

// Função para estabelir conexão WebSocket primerenca
function setupEarlyWebSocketConnection() {
  const state = getState() as any;
  const roomCode = state?.match?.roomCode;
  const userId = state?.user?.id;
  const players = state?.players;

  if (!roomCode || !userId) {
    return;
  }

  //  DETERMINAR PLAYER ROLE BASANT-SE EN LA POSICIÓ A L'ESTAT
  let playerRole: 'player1' | 'player2' | null = null;
  if (players?.player1?.id === userId) {
    playerRole = 'player1';
  } else if (players?.player2?.id === userId) {
    playerRole = 'player2';
  } else {
  }

  //  ENVIAR PLAYER ROLE PER SINCRONITZAR AMB L'API DE SALES
  const wsUrl = playerRole 
    ? `${API_CONFIG.GAME.WS}?room=${roomCode}&userId=${userId}&playerRole=${playerRole}`
    : `${API_CONFIG.GAME.WS}?room=${roomCode}&userId=${userId}`;

  // Tancar connexió existent si n'hi ha
  if ((window as any).gameWebSocket) {
    (window as any).gameWebSocket.close();
  }

  const ws = new WebSocket(wsUrl);
  (window as any).gameWebSocket = ws;

  ws.onopen = () => {
    // Enviar missatge join quan es connecta
    ws.send(JSON.stringify({ type: 'join', room: roomCode, userId: String(userId) }));
  };

ws.onmessage = async (event) => {
    try
    {
      let raw: any = event.data;
      if (raw instanceof Blob) raw = await raw.text();
      else if (raw instanceof ArrayBuffer) raw = new TextDecoder().decode(raw);
      if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (!trimmed || trimmed === 'ping' || trimmed === 'pong') return;
      }
      const message = typeof raw === 'string' ? JSON.parse(raw) : raw;
      
      // Forward message to Pong2dOnline if game is running
      handleGameWebSocketMessage(message);
      
      switch (message?.type) {
        case 'start': {
          maybeStartOnlineGame();
          break;
        }
        case 'ready_broadcast': {
          window.dispatchEvent(new CustomEvent('match:players-updated'));
          break;
        }
        case 'restart_ack': {
          __finishPostedKey = null;
          initPongGame();
          break;
        }
        case 'game_end':
        {
          stopPong2dOnline();
          const s1 = Number(message?.state?.player1Score ?? 0);
          const s2 = Number(message?.state?.player2Score ?? 0);
          const winnerSide: 'left' | 'right' = message?.winner === 'right' ? 'right' : 'left';
          updateScore(s1, s2);
          showGameEndedButtons({ getWinner });
          await postFinishFromGameEnd({
            state: { player1Score: s1, player2Score: s2 },
            winner: winnerSide,
          });
          if (!amIPlayer1Strict()) {
            const code = currentRoomCode();
            if (code) {
              setTimeout(async () => {
                try {
                  const res = await fetch(`/api/matches/rooms/${encodeURIComponent(code)}`, { credentials: 'include' });
                  if (res.ok) {
                    const snapshot = await res.json();
                    if (snapshot?.status !== 'finished') {
                      const payload = {
                        code,
                        score1: Number(message?.state?.player1Score ?? 0),
                        score2: Number(message?.state?.player2Score ?? 0),
                        winnerUserId: (() => {
                          const { p1, p2 } = currentPlayers();
                          const a = Number(message?.state?.player1Score ?? 0);
                          const b = Number(message?.state?.player2Score ?? 0);
                          if (!p1?.id || !p2?.id) return null;
                          return a >= b ? Number(p1.id) : Number(p2.id);
                        })(),
                      };
                      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
                      navigator.sendBeacon?.('/api/matches/rooms/finish', blob);
                    }
                  }
                } catch {}
              }, 1000);
            }
          }
          if ((window as any).__gameRoom?.setGameRunning) {
            (window as any).__gameRoom.setGameRunning(false);
          }
          break;
        }
        default: {
        }
      }
    } catch (err) {
      console.error('[GameRoom] 🔗 Error parsing WebSocket message:', err, event.data);
    }
  };
  ws.onclose = () => {
  };
  ws.onerror = (error) => {
    console.error('[GameRoom] 🔗 Early WebSocket error:', error);
  };
}

function bindReadyButtons() {
  document.querySelectorAll<HTMLButtonElement>('.readyBtn').forEach((btn) => {
    if ((btn as any).__bound) {
      return;
    }
    (btn as any).__bound = true;
    btn.addEventListener('click', async () => {
      const role = (btn.dataset.role as 'player1' | 'player2') || 'player1';
      const state = getState() as any;
      const me = state.user;
      const mine = state.players?.[role];
      const rival = state.players?.[role === 'player1' ? 'player2' : 'player1'];
      
      
      // Sólo permitimos READY cuando: yo ocupo esa card + existe el rival.
      if (!me || !mine || mine.id !== me.id || !rival) {
        return;
      }
      

      btn.disabled = true;
      btn.classList.add('opacity-60','cursor-not-allowed');
      try {
        const { ready } = await markReady(); // POST /ready
        setPlayerReady(role, ready ?? true);

        // Re-render selectivo de la card propia
        document.querySelectorAll(`[data-player-card="${role}"]`).forEach((el) => {
          (el as HTMLElement).outerHTML = renderPlayerCard({
            type: role,
            compact: el.closest('.lg\\:hidden') ? true : false,
          });
        });
        setTimeout(bindReadyButtons, 0);
        
        // MILLORA: Quan l'usuari fa Ready, informa el WebSocket del joc també
        
        // Enviar missatge WebSocket ready si la connexió existeix
        if ((window as any).gameWebSocket && (window as any).gameWebSocket.readyState === WebSocket.OPEN) {
          const currentState = getState() as any;
          const roomCode = currentState?.match?.roomCode;
          const userId = currentState?.user?.id;
          
          if (roomCode && userId) {
            (window as any).gameWebSocket.send(JSON.stringify({ 
              type: 'ready', 
              room: roomCode, 
              userId: String(userId) 
            }));
          } else {
          }
        } else {
        }
        
        maybeStartOnlineGame(); // ADDED
      } catch (err) {
        console.error('[READY] POST falló:', err);
        btn.disabled = false;
        btn.classList.remove('opacity-60','cursor-not-allowed');
        alert('No se pudo marcar READY. Intenta de nuevo.');
      }
    });
  });
}

//  CONTROLAR ESTAT DEL BOTÓ EXIT
export const updateExitButtonState = (gameInProgress: boolean): void => {
  const exitButtons = document.querySelectorAll('#exitGame');
  exitButtons.forEach(button => {
    const btn = button as HTMLButtonElement;
    if (gameInProgress) {
      btn.disabled = true;
      btn.classList.add('opacity-50', 'cursor-not-allowed');
      btn.classList.remove('hover:bg-cyan-200');
      btn.title = 'Cannot exit during game';
    } else {
      btn.disabled = false;
      btn.classList.remove('opacity-50', 'cursor-not-allowed');
      btn.classList.add('hover:bg-cyan-200');
      btn.title = 'Exit game';
    }
  });
};

const exitGame = async (): Promise<void> => {
  
  //  VERIFICAR SI EL JOC ESTÀ EN PROGRES
  if (__onlineGameStarted) {
    return;
  }
  
  // Clean up Pong2dOnline resources
  stopPong2dOnline();
  
  // Mostrar toast d'abandó
  
  // Netejar sessió de joc
  clearGameSession();
  
  // Netejar URL parameters per evitar problemes amb refresh
  window.history.replaceState({}, '', '/dashboard');
  
  // Navegar al dashboard
  navigateTo('/dashboard');
};

//  Wrappers locals per GameRoom que usen renderPlayerCard directament
const renderGameLayoutOnline = (): string => {
  return renderGameLayout(
    { username: '', avatar_url: '' },
    { username: '', avatar_url: '' },
    false
  );
};

let _playersUpdatedBound = false;

/**
 * Safety net:
 * - Si ja hi ha roomCode en estat ⇒ arrenca polling.
 * - Si no, fa quickMatchOnce(), arrenca polling i treu el loader.
 */
async function ensureMatchAndPolling(host: HTMLElement): Promise<void> {
  
  //  INICIALITZAR ESTAT DEL BOTÓ EXIT (mode online - habilitat inicialment)
  updateExitButtonState(false);
  
  const state = getState() as any;  
  // ALWAYS add the event listener for players updated, not just when room exists
  window.addEventListener('match:players-updated', () => {
    refreshPlayerCards(); // Force refresh the UI
    

    
    
    if (!__onlineGameStarted) {
      const bothReady = checkBothPlayersReady();
      
      if (bothReady) {
        maybeStartOnlineGame();
      } else {
      }
    } else {
    }
  });
  
  if (state?.match?.roomCode) {
    initRoomView(state.match.roomCode); //  Això usa SSE, no polling!
    
    const startTick = window.setInterval(() => {
      if (__onlineGameStarted) {
        window.clearInterval(startTick);
        return;
      }
      if (checkBothPlayersReady()) {
        maybeStartOnlineGame();
        window.clearInterval(startTick);
      }
    }, 500);
    return;
  }

  host.querySelector('#gm-safetynet')?.remove();
  const shell = document.createElement('div');
  shell.id = 'gm-safetynet';
  shell.className = 'min-h-[40vh] flex flex-col items-center justify-center text-gray-300 gap-2';
  shell.innerHTML = `
    <div class="animate-spin inline-block w-10 h-10 border-4 border-current border-t-transparent rounded-full mb-2"></div>
    <p class="text-sm opacity-80">Buscando partida disponible…</p>
  `;
  host.appendChild(shell);

  try {
    // TEMP: Check URL for specific room
    const urlParams = new URLSearchParams(window.location.search);
    const specificRoom = urlParams.get('room');
    const specificRole = urlParams.get('role') as 'player1' | 'player2' | null;
    
    if (specificRoom) {
      const { roomCode } = await joinSpecificRoom(specificRoom, specificRole || 'player2');
      if (!roomCode) throw new Error('joinSpecificRoom no va tornar roomCode');
      initRoomView(roomCode); //  SSE connection
    } else {
      const { roomCode } = await quickMatchOnce(); // <- ha de tornar { roomCode, role }
      if (!roomCode) throw new Error('quickMatch no va tornar roomCode');
      initRoomView(roomCode); //  SSE connection
    }
    shell.remove();
  } catch (err: any) {
    console.error('[GameRoom SafetyNet] quickMatch ha fallat:', err);
    shell.innerHTML = `
      <div class="text-red-300 text-lg">No es va poder iniciar / unir a una partida.</div>
      <pre class="mt-2 text-xs opacity-70 max-w-[720px] overflow-auto px-3 py-2 bg-gray-900/60 rounded">${(err?.message || err || 'Error desconegut')}</pre>
      <div class="mt-3 flex gap-2">
        <button class="px-4 py-2 bg-gray-700 rounded-lg text-white" data-action="gm-back">Tornar al dashboard</button>
        <button class="px-4 py-2 bg-blue-700 rounded-lg text-white" data-action="gm-retry">Reintentar</button>
      </div>
    `;
    shell.querySelector('[data-action="gm-back"]')?.addEventListener('click', () => {
      navigateTo('/dashboard');
    });
    shell.querySelector('[data-action="gm-retry"]')?.addEventListener('click', async () => {
      await ensureMatchAndPolling(host);
      window.addEventListener('match:room-missing', () => {
        ensureMatchAndPolling(host);
      }, { once: true });
    });
  }
}

// Renderitzat específic per al mode IA (aïllat, simplificat)
const renderAIGameRoom = async (host: HTMLElement): Promise<void> => {
  const state = getState() as any;
  const userName = state?.user?.username || 'Player';
  
  host.innerHTML = `
    <div class="min-h-screen global-bg p-2 sm:p-4 relative flex flex-col">
      
      <!-- Header simplificat per IA -->
      <div class="w-full flex justify-between items-center mb-4 sm:mb-6">
        <div class="flex-1"></div>
        <div class="text-center">
          <div class="text-white text-sm font-medium">
            ${userName} vs AI
          </div>
          <div class="text-cyan-400 text-lg font-bold">
            First to ${GOALS_TO_WIN} goals wins!
          </div>
        </div>
        <div class="flex-1 flex justify-end">
          <button id="exitGame" class="w-14 h-14 bg-cyan-100 hover:bg-cyan-200 
                                     rounded-full flex items-center justify-center transition-colors">
            <img src="/icons/logout.png" alt="Exit" class="w-8 h-8" />
          </button>
        </div>
      </div>

      <div class="flex-1 flex flex-col items-center justify-center gap-6">

        <!-- Scoreboard amb el mateix estil que altres modes -->
        ${renderScoreboard(false, GOALS_TO_WIN)}
        
        <!-- Canvas Container -->
        <div class="w-full flex justify-center">
          ${renderPongCanvas()}
        </div>

        <!-- Action buttons (només play again i home) -->
        <div class="w-full max-w-[540px] flex gap-3">
          <button id="playAgain" class="flex-1 h-14 bg-cyan-700 hover:bg-cyan-800 
                      rounded-lg justify-center items-center transition-colors hidden">
            <div class="text-white text-lg font-bold">PLAY AGAIN</div>
          </button>
          <button id="homeBtn" class="flex-1 h-14 bg-cyan-200 hover:bg-cyan-300 
                                    rounded-lg justify-center items-center transition-colors hidden">
            <div class="text-teal-800 text-lg font-bold">HOME</div>
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-4">
        ${renderFooter()}
      </div>
    </div>
  `;

  // Inicialitzar components específics del mode IA
  initFooter();
  bindAIGameButtons();
  applyScoreboardNames(); // Aplicar noms correctes per mode IA
  updateExitButtonState(true); //  Disable Exit during IA match
  initPongGame(); // Això cridarà initPong2dIA automàticament
};

// Gestió de botons específica per al mode IA
const bindAIGameButtons = (): void => {
  //  No enable Exit here; handled by game start/end logic
  
  // Exit button
  document.getElementById('exitGame')?.addEventListener('click', async () => {
    stopPong2dIA();
    navigateTo('/dashboard');
  });

  // Play Again button - MODE IA: restart immediat sense esperar ningú
  document.getElementById('playAgain')?.addEventListener('click', () => {
    updateScore(0, 0); // Reset score display
    
    // Hide game ended buttons
    const playAgainBtn = document.getElementById('playAgain');
    const homeBtn = document.getElementById('homeBtn');
    if (playAgainBtn) {
      playAgainBtn.classList.add('hidden');
      playAgainBtn.classList.remove('flex');
    }
    if (homeBtn) {
      homeBtn.classList.add('hidden');
      homeBtn.classList.remove('flex');
    }
    
    // Restart IA game immediately
    initPongGame();
  });

  // Home button
  document.getElementById('homeBtn')?.addEventListener('click', () => {
    stopPong2dIA();
    navigateTo('/dashboard');
  });
};

export const renderGameRoom = async (mode?: 'ai' | 'online' | 'inline'): Promise<void> => {
  const host = document.getElementById('main-content') || document.getElementById('app');
  if (!host) return;

  const gameMode = mode || window.app?.getGameMode?.() || 'ai';

  if (gameMode === 'ai') {
    // MODE IA: Renderitzat simplificat només amb canvas i score
    await renderAIGameRoom(host);
    return;
  }

  // MODE ONLINE/PVP: Verificar només que no sigui un refresh inadequat
  const urlParams = new URLSearchParams(window.location.search);
  const urlRoom = urlParams.get('room');
  const currentState = getState() as any;
  // NOMÉS redirigir si és un refresh amb URL parameters sense context vàlid
  // (això indica que l'usuari ha fet refresh durant una partida)
  if (urlRoom && !currentState?.match?.roomCode) {
    // Netejar URL parameters
    window.history.replaceState({}, '', '/game');
    navigateTo('/dashboard');
    return;
  }

  // MODE ONLINE/PVP: Renderitzat complet amb player cards, ready buttons, etc.
  const isGameEnded = checkIfGameEnded();

  host.innerHTML = `
    <div class="min-h-screen global-bg p-2 sm:p-4 relative flex flex-col">
      
      <!--  MODULAR: Header -->
      ${renderGameHeader(isGameEnded)}

      <div class="flex-1 flex flex-col items-center justify-center gap-3 sm:gap-6">

        <!--  MODULAR: Scoreboard -->
        ${renderScoreboard(isGameEnded, GOALS_TO_WIN)}
        
        <!--  MODULAR: Layout responsive -->
        <div class="w-full flex justify-center">
          ${renderGameLayoutOnline()}
        </div>
      </div>

      <!--  MODULAR: Footer -->
      <div class="mt-2 sm:mt-4">
        ${renderFooter()}
      </div>
    </div>
  </div>
`;

  // TEMP: Check for URL parameters and force room creation
  
  const urlRole = urlParams.get('role');

  //  INICIALITZAR: Tots els components
  initFooter();
  initPongGame();
  
  // Només inicialitzar event listeners online si no és mode IA
  if (gameMode !== 'ai') {
    initGameRoomEventListeners();
  }

  // Additional initialization (previously misplaced)
  applyScoreboardNames();

  // Safety net per assegurar join + polling
  await ensureMatchAndPolling(host);
  const onGone = async () => {
    await ensureMatchAndPolling(host);
  };
  window.addEventListener('match:room-gone', onGone, { once: false });
  if (!_playersUpdatedBound) {
    _playersUpdatedBound = true;
    window.addEventListener('match:players-updated', onPlayersUpdatedOncePerMount, { passive: true });
  }

  const code = (getState() as any)?.match?.roomCode;
  if (code) initRoomView(code); //  SSE connection

  setTimeout(bindReadyButtons, 0);
};

function onPlayersUpdatedOncePerMount() {
  refreshPlayerCards();
  applyScoreboardNames();
}

// NUEVO: Event listeners separados para GameRoom
const initGameRoomEventListeners = (): void => {
  // Configurar connexió WebSocket primerenca
  setupEarlyWebSocketConnection();
  
  // MILLOR: Només fer leave en tancament real de pestanya/navegador
  let isLeavingGame = false;
  let gameIsRunning = false;
  
  // Export functions to module scope so we can use them
  (window as any).__gameRoom = {
    setGameRunning: (running: boolean) => {
      gameIsRunning = running;
    }
  };
  
  window.addEventListener('beforeunload', (event) => {
    
    // Aturar SSE connection sempre quan sortim
    destroyRoomView();
    
    // Only leave room if:
    // 1. Not explicitly leaving the game AND
    // 2. Game is not currently running (to prevent Firefox aggressive beforeunload during game start)
    if (!isLeavingGame && !gameIsRunning) {
      leaveCurrentRoomSync();
    } else {
    }
  });
  
  // Marcar quan sortim explícitament del joc
  document.getElementById('exitGame')?.addEventListener('click', async () => {
    isLeavingGame = true;
    
    //  USAR LA FUNCIÓ exitGame QUE JA TÉ LES VALIDACIONS
    await exitGame();
  });

  // SISTEMA SIMPLIFICAT: Eliminem Play Again i Home buttons
  // Quan el joc acaba, sortim automàticament al dashboard
};

// Funció per inicialitzar el joc Pong dins del GameRoom
const initPongGame = (): void => {
  const pongContainer = document.getElementById('pongContainer');
  if (!pongContainer) {
    console.error('[GameRoom] Pong container NO trobat!');
    return;
  }

  // Aturar joc anterior si existeix
  stopPong2dIA();

  // Neteja el contenidor
  pongContainer.innerHTML = '';

  const canvas = createResponsivePongCanvas(pongContainer);

  // Llegeix el mode de joc global
  const mode = (window as any).app?.getGameMode?.() || 'ai';
  if (mode === 'ai') {
    initPong2dIA(canvas, updateScore);
  } else if (mode === 'inline') {
    renderPong2dInline();
  } else if (mode === 'online' || mode === 'tournament') {
    // ADDED: para online/tournament NO iniciar aquí.
    // Se iniciará cuando checkBothPlayersReady() sea true -> maybeStartOnlineGame()
  } else {
    console.warn('Unknown game mode:', mode);
  }
};

export const updateScore = createScoreUpdater({
  goalsToWin: GOALS_TO_WIN,
  onGameEnded: () => {
    showGameEndedButtons({ getWinner });
    updateExitButtonState(false); //  Enable Exit after IA match ends
  },
});

function checkBothPlayersReady(): boolean {
  const state = getState() as any;
  const p1 = state?.players?.player1;
  const p2 = state?.players?.player2;
  
  
  const bothReady = !!(p1?.ready && p2?.ready);
  
  return bothReady;
}

let __onlineGameStarted = false;

// Funció per resetar el flag del joc online (cridada des de Pong2dOnline)
export const resetOnlineGameFlag = (): void => {
  __onlineGameStarted = false;
  
  //  HABILITAR BOTÓ EXIT QUAN EL JOC ACABA
  updateExitButtonState(false);
};

function maybeStartOnlineGame(): void {
  
  if (__onlineGameStarted) {
    return;
  }
  
  const readyStatus = checkBothPlayersReady();
  
  if (!readyStatus) {
    return;
  }

  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement | null;
  
  if (!canvas) {
    return;
  }

  __onlineGameStarted = true;
  __finishPostedKey = null;
  
  //  DESHABILITAR BOTÓ EXIT DURANT EL JOC
  updateExitButtonState(true);
  
  // Mark game as running to prevent premature room leaving
  if ((window as any).__gameRoom?.setGameRunning) {
    (window as any).__gameRoom.setGameRunning(true);
  }
  
  try {
    
    initPong2dOnline(canvas, updateScore);
  } catch (error) {
    console.error('[GameRoom]  Error iniciant joc:', error);
    console.error('[GameRoom]  Error stack:', (error as Error)?.stack);
    __onlineGameStarted = false; // Reset si hi ha error
    
    // Reset game running state on error
    if ((window as any).__gameRoom?.setGameRunning) {
      (window as any).__gameRoom.setGameRunning(false);
    }
  }
}