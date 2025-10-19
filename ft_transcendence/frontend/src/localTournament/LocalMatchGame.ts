import { navigateTo } from '../core/router';
import i18n from '../core/i18n';
import { renderFooter, initFooter } from '../components/global/Footer';
import { renderDemoPlayerCard } from '../components/game/DemoPlayerCard';
import { renderPongCanvas } from '../components/game/PongCanvas';
import { initPong2dPvP } from '../components/game/Pong2dPvP';
import { createResponsivePongCanvas } from '../components/game/pongCanvasUtils';
import { getLocalTournament, recordMatchResult, saveLocalTournament } from './LocalTournamentStore';

const GOALS_TO_WIN = 5;

function renderGameHeader(): string {
  return `
  <div class="w-full flex justify-center items-center mb-4 sm:mb-6">
    <div class="text-center px-2">
      <div class="text-white text-xs sm:text-sm md:text-base font-medium">
        ${i18n.t('game.firstTo') || 'First to'} ${GOALS_TO_WIN} ${i18n.t('game.goals') || 'goals wins!'}
      </div>
      <div id="gameStatus" class="text-cyan-400 text-sm sm:text-lg font-bold mt-1">
        ${i18n.t('game.playing') || 'Playing...'}
      </div>
    </div>
  </div>`;
}

function desktopLayout(p1: { name: string; avatar: string }, p2: { name: string; avatar: string }) {
  return `
  <div class="hidden lg:flex w-full max-w-[1300px] items-stretch gap-6">
    <div class="flex flex-col justify-start self-start">
      ${renderDemoPlayerCard({ type: 'player1', name: p1.name, avatar: p1.avatar })}
    </div>
    <div class="flex-1 flex justify-center">
      ${renderPongCanvas()}
    </div>
    <div class="flex flex-col justify-end self-end">
      ${renderDemoPlayerCard({ type: 'player2', name: p2.name, avatar: p2.avatar })}
    </div>
  </div>`;
}

function mobileLayout(p1: { name: string; avatar: string }, p2: { name: string; avatar: string }) {
  return `
  <div class="lg:hidden w-full max-w-[600px] flex flex-col gap-4">
    <div class="flex justify-between gap-3 px-2">
      ${renderDemoPlayerCard({ type: 'player1', compact: true, name: p1.name, avatar: p1.avatar })}
      ${renderDemoPlayerCard({ type: 'player2', compact: true, name: p2.name, avatar: p2.avatar })}
    </div>
    <div class="w-full">
      ${renderPongCanvas()}
    </div>
  </div>`;
}

let _docClickHandler: ((e: MouseEvent) => void) | null = null;

export function renderLocalMatchGame(matchId: number): void {
  const app = document.getElementById('app')!;
  const state = getLocalTournament();
  if (!state) { navigateTo('/'); return; }

  const match = state.matches.find(m => m.id === matchId);
  if (!match || match.status !== 'in_progress' || !match.player1 || !match.player2) {
    navigateTo('/local-tournament/bracket');
    return;
  }

  const p1 = { name: match.player1.name, avatar: match.player1.avatar };
  const p2 = { name: match.player2.name, avatar: match.player2.avatar };

  app.innerHTML = `
    <div class="min-h-screen global-bg p-2 sm:p-4 relative flex flex-col">
      ${renderGameHeader()}
      <div class="flex-1 flex flex-col items-center justify-center gap-3 sm:gap-6">
        <!-- Marcador -->
        <div class="w-full flex justify-center mb-0 sm:mb-2">
          <div class="bg-gray-900 rounded-[15px] sm:rounded-[20px] px-2 sm:px-6 py-0.5 sm:py-2 shadow-[2px_2px_10px_0px_rgba(0,240,255,0.20)] outline outline-2 outline-offset-[-2px] outline-cyan-500">
            <div class="flex items-center gap-4 sm:gap-8 text-white">
              <div class="text-center">
                <div class="text-xs sm:text-sm text-gray-300">${p1.name || 'Player 1'}</div>
                <div id="player1Score" class="text-xl sm:text-3xl font-bold text-cyan-400">0</div>
                <div class="w-12 sm:w-16 h-1.5 sm:h-2 bg-gray-700 rounded mt-1 sm:mt-2">
                  <div id="player1Progress" class="h-full bg-cyan-400 rounded transition-all duration-300" style="width: 0%"></div>
                </div>
              </div>
              <div class="text-lg sm:text-2xl text-gray-400">:</div>
              <div class="text-center">
                <div class="text-xs sm:text-sm text-gray-300">${p2.name || 'Player 2'}</div>
                <div id="player2Score" class="text-xl sm:text-3xl font-bold text-yellow-400">0</div>
                <div class="w-12 sm:w-16 h-1.5 sm:h-2 bg-gray-700 rounded mt-1 sm:mt-2">
                  <div id="player2Progress" class="h-full bg-yellow-400 rounded transition-all duration-300" style="width: 0%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="w-full flex justify-center">
          ${desktopLayout(p1, p2)}
          ${mobileLayout(p1, p2)}
        </div>

        <!-- Controles al terminar -->
        <div class="w-full max-w-[540px] flex gap-2 sm:gap-3 px-2">
          <!-- Rondas intermedias: CONTINUE -->
          <button id="finishMatch" type="button" class="flex-1 h-12 sm:h-14 px-4 sm:px-6 py-2 sm:py-3 bg-cyan-700 hover:bg-cyan-800 
                  rounded-lg justify-center items-center transition-colors hidden">
            <div class="text-white text-base sm:text-lg font-bold">${i18n.t('game.continue') || 'CONTINUE'}</div>
          </button>
          <!-- FINAL: Volver a brackets -->
          <button id="backToBracket" type="button" class="flex-1 h-12 sm:h-14 px-4 sm:px-6 py-2 sm:py-3 bg-cyan-700 hover:bg-cyan-800 
                  rounded-lg justify-center items-center transition-colors hidden">
            <div class="text-white text-base sm:text-lg font-bold">${i18n.t('tournament.bracket') || 'BRACKET'}</div>
          </button>
        </div>
      </div>
    </div>
  `;
  initFooter();

  // Inicia el juego inmediatamente
  setTimeout(() => {
    const container = document.getElementById('pongContainer');
    if (!container) return;
    container.innerHTML = '';
    const canvas = createResponsivePongCanvas(container);
    initPong2dPvP(canvas, (s1: number, s2: number) => updateScore(matchId, s1, s2));
  }, 0);

  // No exit button in local tournament match

  // === Delegación global (fallback robusto) ===
  // Si por lo que sea el canvas roba el foco, esta escucha a nivel documento garantiza la navegación.
  if (_docClickHandler) {
    document.removeEventListener('click', _docClickHandler);
  }
  _docClickHandler = (ev: MouseEvent) => {
    const el = ev.target as HTMLElement;
    if (el.closest?.('#backToBracket')) {
      ev.preventDefault();
      ev.stopPropagation();
      navigateTo('/local-tournament/bracket');
    }
    if (el.closest?.('#finishMatch')) {
      ev.preventDefault();
      ev.stopPropagation();
      navigateTo('/local-tournament/bracket');
    }
  };
  document.addEventListener('click', _docClickHandler);
}

function checkEnded(): boolean {
  const a = parseInt(document.getElementById('player1Score')?.textContent || '0');
  const b = parseInt(document.getElementById('player2Score')?.textContent || '0');
  return a >= GOALS_TO_WIN || b >= GOALS_TO_WIN;
}

export function updateScore(matchId: number, p1: number, p2: number): void {
  const s1El = document.getElementById('player1Score');
  const s2El = document.getElementById('player2Score');
  const pr1 = document.getElementById('player1Progress');
  const pr2 = document.getElementById('player2Progress');
  if (s1El) s1El.textContent = String(p1);
  if (s2El) s2El.textContent = String(p2);
  if (pr1) pr1.style.width = `${Math.min((p1 / GOALS_TO_WIN) * 100, 100)}%`;
  if (pr2) pr2.style.width = `${Math.min((p2 / GOALS_TO_WIN) * 100, 100)}%`;

  if (!checkEnded()) return;

  const st = getLocalTournament();
  if (!st) return;

  // Guarda resultado y avanza bracket
  recordMatchResult(st, matchId, p1, p2);
  saveLocalTournament(st);

  // Mensaje de ganador
  const gameStatus = document.getElementById('gameStatus');
  if (gameStatus) {
    const after = getLocalTournament();
    const m = after?.matches.find(m => m.id === matchId);
    const winnerName = (p1 > p2) ? m?.player1?.name : m?.player2?.name;
    gameStatus.innerHTML = `${winnerName || ''} ${i18n.t('game.wins') || 'Wins!'}`;
    gameStatus.className = 'text-green-400 text-xl font-bold text-center animate-bounce';
  }

  // Desactiva el canvas para que no bloquee clics tras finalizar
  const canvasEl = document.querySelector('#pongContainer canvas') as HTMLCanvasElement | null;
  if (canvasEl) {
    // Evita que el canvas intercepte clicks tras terminar
    canvasEl.style.pointerEvents = 'none';
  }

  const afterState = getLocalTournament();
  const isFinished = !!afterState?.finishedAt;

  const btnContinue = document.getElementById('finishMatch') as HTMLButtonElement | null;
  const btnBackToBracket = document.getElementById('backToBracket') as HTMLButtonElement | null;

  if (isFinished) {
    btnBackToBracket?.classList.remove('hidden');
    // además del delegado global, dejo un listener directo
    btnBackToBracket?.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      navigateTo('/local-tournament/bracket');
    }, { once: true });
  } else {
    btnContinue?.classList.remove('hidden');
    btnContinue?.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      navigateTo('/local-tournament/bracket');
    }, { once: true });
  }
}

// Limpieza opcional cuando se abandone la página del match
window.addEventListener('popstate', () => {
  if (_docClickHandler) {
    document.removeEventListener('click', _docClickHandler);
    _docClickHandler = null;
  }
});