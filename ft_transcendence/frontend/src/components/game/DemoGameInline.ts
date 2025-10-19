import { navigateTo } from '../../core/router';
import { renderFooter, initFooter } from '../global/Footer';
import i18n from '../../core/i18n';
import { renderDemoPlayerCard } from './DemoPlayerCard';
import { renderPongCanvas } from './PongCanvas';
import { initPong2dPvP } from './Pong2dPvP';
import { createResponsivePongCanvas } from './pongCanvasUtils';
import { showGameEndedButtons } from './GameEndedButtons';
import { createScoreUpdater, getWinnerFromDOM } from './ScoreUpdater';
import { renderGameHeader, renderGameLayout } from './GameLayouts';

const GOALS_TO_WIN = 5;

const getWinner = (): 'player1' | 'player2' | null => {
  return getWinnerFromDOM(GOALS_TO_WIN);
};

const endDemo = (): void => {
  navigateTo('/');
};

//  Wrappers locals per DemoGameInline que adapten 'name' a 'username'
interface DemoPlayer {
  name: string;
  avatar: string;
}

//  Header personalitzat per DemoGameInline sense exit button
const renderDemoGameHeader = (isGameEnded: boolean): string => `
  <div class="w-full text-center px-2 mb-4 sm:mb-6">
    <div class="text-white text-xs sm:text-sm md:text-base font-medium">
      ${i18n.t('game.firstTo') || 'First to'} ${GOALS_TO_WIN} ${i18n.t('game.goals') || 'goals wins!'}
    </div>
    <div id="gameStatus" class="text-cyan-400 text-sm sm:text-lg font-bold mt-1">
      ${isGameEnded ? '' : (i18n.t('game.playing') || 'Playing...')}
    </div>
  </div>
`;

// NUEVO: Botones de acción modularizados
const renderActionButtons = (isGameEnded: boolean): string => `
  <div class="w-full max-w-[540px] flex gap-2 sm:gap-3 px-2">
    <button id="playAgain" class="flex-1 h-12 sm:h-14 px-4 sm:px-6 py-2 sm:py-3 bg-cyan-700 hover:bg-cyan-800 
                rounded-lg justify-center items-center transition-colors ${isGameEnded ? 'flex' : 'hidden'}">
      <div class="text-white text-base sm:text-lg font-bold">${i18n.t('game.playAgain') || 'PLAY AGAIN'}</div>
    </button>
    <button id="homeBtn" class="flex-1 h-12 sm:h-14 px-4 sm:px-6 py-2 sm:py-3 bg-cyan-200 hover:bg-cyan-300 
                                rounded-lg justify-center items-center transition-colors ${isGameEnded ? 'flex' : 'hidden'}">
      <div class="text-teal-800 text-base sm:text-lg font-bold">${i18n.t('game.login') || 'LOGIN'}</div>
    </button>
  </div>
`;

export const renderDemoGameInline = (): void => {
  const app = document.getElementById('app')!;
  // Restore state from localStorage if present
  let player1 = { name: '', avatar: '' };
  let player2 = { name: '', avatar: '' };
  let gameStarted = false;
  try {
    const saved = localStorage.getItem('demoGameInline');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.player1) player1 = parsed.player1;
      if (parsed.player2) player2 = parsed.player2;
      if (parsed.gameStarted) gameStarted = true;
    }
  } catch {}

  function renderSetupForm() {
    app.innerHTML = `
      <div class="min-h-screen global-bg flex flex-col items-center justify-center p-4">
        <h2 class="text-2xl font-bold text-cyan-300 mb-6">Configura els jugadors</h2>
        <div class="flex flex-col sm:flex-row gap-8">
          <div class="flex flex-col items-center gap-3">
            <div class="text-lg font-semibold text-white mb-2">Player 1</div>
            <div class="flex gap-2">
              ${[1,2,3,4].map(a => `
                <img src="/images/avatar${a}.png" data-player="1" data-avatar="avatar${a}.png" class="avatar-select w-14 h-14 rounded-full border-2 ${player1.avatar==='avatar'+a+'.png'?'border-cyan-400':'border-gray-600'} cursor-pointer hover:scale-105 transition" />
              `).join('')}
            </div>
            <input type="text" id="player1Name" placeholder="Nom del jugador" class="mt-2 px-3 py-2 rounded bg-gray-800 text-white text-center" maxlength="16" />
          </div>
          <div class="flex flex-col items-center gap-3">
            <div class="text-lg font-semibold text-white mb-2">Player 2</div>
            <div class="flex gap-2">
              ${[1,2,3,4].map(a => `
                <img src="/images/avatar${a}.png" data-player="2" data-avatar="avatar${a}.png" class="avatar-select w-14 h-14 rounded-full border-2 ${player2.avatar==='avatar'+a+'.png'?'border-yellow-400':'border-gray-600'} cursor-pointer hover:scale-105 transition" />
              `).join('')}
            </div>
            <input type="text" id="player2Name" placeholder="Nom del jugador" class="mt-2 px-3 py-2 rounded bg-gray-800 text-white text-center" maxlength="16" />
          </div>
        </div>
        <button id="startDemoGame" class="mt-8 px-6 py-3 bg-cyan-700 text-white font-bold rounded-lg disabled:opacity-50" disabled>
          Començar partida
        </button>

        <!-- Back to Home Button -->
        <button id="backToHome" class="absolute top-4 left-4 text-cyan-400 hover:text-cyan-300 flex items-center gap-2 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          <span class="text-sm font-medium">${i18n.t('common.backToHome') || 'Back to Home'}</span>
        </button>
              
      </div>
    `;
    document.querySelectorAll('.avatar-select').forEach(img => {
      img.addEventListener('click', e => {
        const el = e.currentTarget as HTMLImageElement;
        const p = el.getAttribute('data-player');
        const av = el.getAttribute('data-avatar');
        if (p === '1') player1.avatar = av!;
        else player2.avatar = av!;
        renderSetupForm();
        setTimeout(bindInputs, 0);
      });
    });
    function bindInputs() {
      const input1 = document.getElementById('player1Name') as HTMLInputElement;
      const input2 = document.getElementById('player2Name') as HTMLInputElement;
      if (input1) {
        input1.value = player1.name;
        input1.addEventListener('input', e => {
          player1.name = (e.target as HTMLInputElement).value;
          checkReady();
        });
      }
      if (input2) {
        input2.value = player2.name;
        input2.addEventListener('input', e => {
          player2.name = (e.target as HTMLInputElement).value;
          checkReady();
        });
      }
    }
    bindInputs();
    function checkReady() {
      const btn = document.getElementById('startDemoGame') as HTMLButtonElement;
      if (btn) {
        btn.disabled = !(player1.name && player1.avatar && player2.name && player2.avatar);
      }
    }
    checkReady();
    document.getElementById('startDemoGame')?.addEventListener('click', () => {
      gameStarted = true;
      // Persist state
      localStorage.setItem('demoGameInline', JSON.stringify({ player1, player2, gameStarted: true }));
      renderDemoGame();
    });

    //  Bind backToHome button inside renderSetupForm so element exists
    document.getElementById('backToHome')?.addEventListener('click', () => {
      localStorage.removeItem('demoGameInline');
      navigateTo('/landing');
    });
  }

  function renderDemoGame() {
  // Persist state
  localStorage.setItem('demoGameInline', JSON.stringify({ player1, player2, gameStarted: true }));
  app.innerHTML = `
      <div class="min-h-screen global-bg p-2 sm:p-4 relative flex flex-col">
        ${renderDemoGameHeader(false)}
        <div class="flex-1 flex flex-col items-center justify-center gap-3 sm:gap-6">
          <!-- Marcador -->
          <div class="w-full flex justify-center mb-0 sm:mb-2">
            <div class="bg-gray-900 rounded-[15px] sm:rounded-[20px] px-2 sm:px-6 py-0.5 sm:py-2 shadow-[2px_2px_10px_0px_rgba(0,240,255,0.20)] outline outline-2 outline-offset-[-2px] outline-cyan-500">
              <div class="flex items-center gap-4 sm:gap-8 text-white">
                <div class="text-center">
                  <div class="text-xs sm:text-sm text-gray-300">${player1.name || 'Player 1'}</div>
                  <div id="player1Score" class="text-xl sm:text-3xl font-bold text-cyan-400">0</div>
                  <div class="w-12 sm:w-16 h-1.5 sm:h-2 bg-gray-700 rounded mt-1 sm:mt-2">
                    <div id="player1Progress" class="h-full bg-cyan-400 rounded transition-all duration-300" style="width: 0%"></div>
                  </div>
                </div>
                <div class="text-lg sm:text-2xl text-gray-400">:</div>
                <div class="text-center">
                  <div class="text-xs sm:text-sm text-gray-300">${player2.name || 'Player 2'}</div>
                  <div id="player2Score" class="text-xl sm:text-3xl font-bold text-yellow-400">0</div>
                  <div class="w-12 sm:w-16 h-1.5 sm:h-2 bg-gray-700 rounded mt-1 sm:mt-2">
                    <div id="player2Progress" class="h-full bg-yellow-400 rounded transition-all duration-300" style="width: 0%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="w-full flex justify-center">
            ${renderGameLayout(
              { username: player1.name, avatar_url: player1.avatar },
              { username: player2.name, avatar_url: player2.avatar },
              true
            )}
          </div>
          ${renderActionButtons(false)}
        </div>
        <div class="mt-2 sm:mt-4">${renderFooter()}</div>
      </div>
    `;
    initFooter();
    setTimeout(() => {
      const pongContainer = document.getElementById('pongContainer');
      if (pongContainer) {
        pongContainer.innerHTML = '';
        const canvas = createResponsivePongCanvas(pongContainer);
        // Pass player info to Pong2dPvP for rendering
        initPong2dPvP(canvas, updateScore, player1, player2);
      }
    }, 0);
    initDemoGameInlineEventListeners();
  }

  if (!gameStarted) renderSetupForm();
  else renderDemoGame();
};

// NUEVO: Event listeners separados
const initDemoGameInlineEventListeners = (): void => {
  document.getElementById('playAgain')?.addEventListener('click', () => {
    // Reset game state and restart
    const saved = localStorage.getItem('demoGameInline');
    let player1 = { name: '', avatar: '' };
    let player2 = { name: '', avatar: '' };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.player1) player1 = parsed.player1;
        if (parsed.player2) player2 = parsed.player2;
      } catch {}
    }
    localStorage.setItem('demoGameInline', JSON.stringify({ player1, player2, gameStarted: true }));
    // Re-render game
    renderDemoGameInline();
  });

  document.getElementById('homeBtn')?.addEventListener('click', () => {
    localStorage.removeItem('demoGameInline');
    navigateTo('/landing');
  });
};

export const updateScore = createScoreUpdater({
  goalsToWin: GOALS_TO_WIN,
  onGameEnded: () => {
    showGameEndedButtons({ getWinner });
  },
});
