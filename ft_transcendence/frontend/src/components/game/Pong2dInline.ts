import { navigateTo } from '../../core/router';
import { renderFooter, initFooter } from '../global/Footer';
import i18n from '../../core/i18n';
import { renderPongCanvas } from './PongCanvas';
import { initPong2dPvP, PongPlayerInfo } from './Pong2dPvP';
import { createResponsivePongCanvas } from './pongCanvasUtils';
import { getState } from '../../core/state';
import { showGameEndedButtons } from './GameEndedButtons';
import { createScoreUpdater, getWinnerFromDOM } from './ScoreUpdater';
import { renderGameLayout } from './GameLayouts';
import { saveMatchHistory } from '../../inlineRegistered/RegisteredTournamentService';

const GOALS_TO_WIN = 5;

const getWinner = (): 'player1' | 'player2' | null => {
  return getWinnerFromDOM(GOALS_TO_WIN);
};

// Helper functions for layout rendering (reusable components)
interface InlinePlayer {
  username: string;
  avatar_url?: string;
  avatar?: string;
}

//  Wrappers locals per Pong2dInline
const renderInlineGameLayout = (player1: InlinePlayer, player2: InlinePlayer): string => {
  const resolve = (src?: string) => {
    if (!src) return '';
    const s = String(src).trim();
    if (!s) return '';
    if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/')) return s;
    return `/images/${s}`;
  };
  const p1 = { ...player1, avatar_url: resolve(player1.avatar_url || player1.avatar) };
  const p2 = { ...player2, avatar_url: resolve(player2.avatar_url || player2.avatar) };
  return renderGameLayout(p1, p2, true);
};

export interface RegisteredUser {
  id: number;
  username: string;
  avatar_url?: string;
  avatar?: string;
}

// Track current opponent for persistence
let _inlineOpponent: RegisteredUser | null = null;


export const renderPong2dInline = async (): Promise<void> => {
  const rawUser = getState().user;
  const currentUser = rawUser && typeof rawUser.id === 'number' ? rawUser : { id: -1, username: '', avatar_url: '' };
  const app = document.getElementById('app')!;
  let player2: RegisteredUser | null = null;
  let users: RegisteredUser[] = [];
  let gameStarted = false;

  // Helper to refresh users from state or API
  let lastUserFetchError = '';
  async function refreshUsers() {
    const stateUsers = getState().users || [];
    if (stateUsers.length > 0) {
      users = stateUsers.filter((u: RegisteredUser) => u.id !== currentUser.id);
      lastUserFetchError = '';
    } else {
      try {
  const res = await fetch('/api/users', {
          credentials: 'include'
        });
        const raw = await res.text();
        let arr: RegisteredUser[] = [];
        try {
          arr = JSON.parse(raw);
        } catch (e) {
          lastUserFetchError = 'Error parsing JSON: ' + String(e);
          console.error('[Pong2dInline] Error parsing JSON:', e);
        }
        users = arr.filter((u: RegisteredUser) => u.id !== currentUser.id);
        if (!Array.isArray(arr) || users.length === 0) {
          lastUserFetchError = lastUserFetchError || 'No users found in response.';
        } else {
          lastUserFetchError = '';
        }
      } catch (err) {
        users = [];
        lastUserFetchError = 'Error fetching user-service: ' + String(err);
        console.warn('[Pong2dInline] Error fetching user-service:', err);
      }
    }
    if (lastUserFetchError) {
      console.error('[Pong2dInline] lastUserFetchError:', lastUserFetchError);
    }
  }

  await refreshUsers();

  // Listen for SSE user updates and refresh
  window.addEventListener('users:updated', async () => {
    await refreshUsers();
    renderSetupForm();
  });
  window.addEventListener('users_reset', async () => {
    await refreshUsers();
    renderSetupForm();
  });

  function renderSetupForm() {
    app.innerHTML = `
      <div class="min-h-screen global-bg flex flex-col items-center justify-center p-4">
        <button id="backToHome" class="absolute top-4 left-4 text-cyan-400 hover:text-cyan-300 flex items-center gap-2 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          <span class="text-sm font-medium">${i18n.t('common.backToHome') || 'Back to Home'}</span>
        </button>
        <h2 class="text-2xl font-bold text-cyan-300 mb-6">Selecciona el segon jugador</h2>
        <div class="flex flex-col gap-6 w-full max-w-md">
          <div class="flex flex-col items-center gap-3">
            <div class="text-lg font-semibold text-white mb-2">Player 2</div>
            <select id="player2Select" class="w-full px-3 py-2 rounded bg-gray-800 text-white text-center">
              <option value="">-- Selecciona un usuari --</option>
              ${users.map(u => `<option value="${u.id}" ${player2?.id===u.id?'selected':''}>${u.username}</option>`).join('')}
            </select>
            ${users.length === 0 ? `<div class="mt-4 text-red-400">No hi ha cap altre usuari registrat disponible.</div>` : ''}
            ${lastUserFetchError ? `<div class="mt-2 text-red-500 text-sm">Error: ${lastUserFetchError}</div>` : ''}
          </div>
        </div>
        <button id="startInlineGame" class="mt-8 px-6 py-3 bg-cyan-700 text-white font-bold rounded-lg disabled:opacity-50" ${!player2 ? 'disabled' : ''}>
          Començar partida
        </button>
      </div>
    `;
    document.getElementById('player2Select')?.addEventListener('change', e => {
      const id = (e.target as HTMLSelectElement).value;
      player2 = users.find(u => String(u.id) === id) || null;
      renderSetupForm();
    });
    document.getElementById('startInlineGame')?.addEventListener('click', () => {
      if (player2) {
        gameStarted = true;
        renderInlineGame();
      }
    });
    document.getElementById('backToHome')?.addEventListener('click', () => {
      navigateTo('/');
    });
  }

  function renderInlineGame() {
    // Use component-based rendering
    app.innerHTML = `
      <div class="min-h-screen global-bg p-2 sm:p-4 relative flex flex-col">
        <div class="flex-1 flex flex-col items-center justify-center gap-3 sm:gap-6">
          <!-- Game Status -->
          <div id="gameStatus" class="text-cyan-400 text-lg sm:text-2xl font-bold text-center min-h-[30px]">Playing...</div>
          
          <!-- Scoreboard -->
          <div class="w-full flex justify-center mb-0 sm:mb-2">
            <div class="bg-gray-900 rounded-[15px] sm:rounded-[20px] px-2 sm:px-6 py-0.5 sm:py-2 shadow-[2px_2px_10px_0px_rgba(0,240,255,0.20)] outline outline-2 outline-offset-[-2px] outline-cyan-500">
              <div class="flex items-center gap-4 sm:gap-8 text-white">
                <div class="text-center">
                  <div class="text-xs sm:text-sm text-gray-300">${currentUser.username || 'Player 1'}</div>
                  <div id="player1Score" class="text-xl sm:text-3xl font-bold text-cyan-400">0</div>
                  <div class="w-12 sm:w-16 h-1.5 sm:h-2 bg-gray-700 rounded mt-1 sm:mt-2">
                    <div id="player1Progress" class="h-full bg-cyan-400 rounded transition-all duration-300" style="width: 0%"></div>
                  </div>
                </div>
                <div class="text-lg sm:text-2xl text-gray-400">:</div>
                <div class="text-center">
                  <div class="text-xs sm:text-sm text-gray-300">${player2?.username || 'Player 2'}</div>
                  <div id="player2Score" class="text-xl sm:text-3xl font-bold text-yellow-400">0</div>
                  <div class="w-12 sm:w-16 h-1.5 sm:h-2 bg-gray-700 rounded mt-1 sm:mt-2">
                    <div id="player2Progress" class="h-full bg-yellow-400 rounded transition-all duration-300" style="width: 0%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Game Layout with components -->
          <div class="w-full flex justify-center">
            ${renderInlineGameLayout(currentUser, player2 || { username: 'Player 2', avatar_url: '', avatar: '' })}
          </div>
          
          <!-- Action Buttons -->
          <div class="w-full max-w-[540px] flex gap-3 mt-4">
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
      </div>
    `;
    initFooter();
    setTimeout(() => {
      const pongContainer = document.getElementById('pongContainer');
      if (pongContainer && player2) {
        pongContainer.innerHTML = '';
        const canvas = createResponsivePongCanvas(pongContainer);
        // Pass real user info to Pong2dPvP
        _inlineOpponent = player2;
        const resolve = (src?: string) => {
          if (!src) return '';
          const s = String(src).trim();
          if (!s) return '';
          if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/')) return s;
          return `/images/${s}`;
        };
        initPong2dPvP(canvas, updateScore, {
          name: currentUser.username,
          avatar: resolve(currentUser.avatar_url)
        }, {
          name: player2?.username || '',
          avatar: resolve(player2?.avatar_url || player2?.avatar)
        });
      }
    }, 0);

    // Bind event listeners for action buttons
    document.getElementById('playAgain')?.addEventListener('click', () => {
      renderPong2dInline();
    });
    document.getElementById('homeBtn')?.addEventListener('click', () => {
      navigateTo('/dashboard');
    });
  }

  if (!gameStarted) renderSetupForm();
  else renderInlineGame();
};

export const updateScore = createScoreUpdater({
  goalsToWin: GOALS_TO_WIN,
  onGameEnded: async () => {
    showGameEndedButtons({ getWinner });
    try {
      const s1 = Number.parseInt(document.getElementById('player1Score')?.textContent || '0', 10);
      const s2 = Number.parseInt(document.getElementById('player2Score')?.textContent || '0', 10);
      const me = (getState() as any)?.user;
      const opp = _inlineOpponent;
      if (!me?.id || !opp?.id) {
        console.warn('[INLINE-1v1] Missing me.id/opponent; skip persisting match');
        return;
      }
      await saveMatchHistory({
        player1Id: Number(me.id),
        player2Id: Number(opp.id),
        player1Name: String(me.username || 'Player 1'),
        player2Name: String(opp.username || 'Player 2'),
        score1: s1,
        score2: s2,
        mode: 'inline-1v1',
        played_at: new Date().toISOString(),
        tournament_id: null
      });
    } catch (e) {
      console.warn('[INLINE-1v1] Persist failed:', e);
    }
  },
});

