import { navigateTo } from '../core/router';
import i18n from '../core/i18n';
import { initPong2dPvP } from '../components/game/Pong2dPvP';
import { createResponsivePongCanvas } from '../components/game/pongCanvasUtils';
import { renderPongCanvas } from '../components/game/PongCanvas';
import { renderFooter, initFooter } from '../components/global/Footer';
import { getInlineRegistered, saveInlineRegistered, reportLocalResult } from './RegisteredTournamentStore';
import { saveMatchHistory } from './RegisteredTournamentService';

const GOALS_TO_WIN = 5;

export function renderRegisteredMatchGame(): string {
  const header = `
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

  const scoreboard = `
    <div class="w-full flex justify-center mb-0 sm:mb-2">
      <div class="bg-gray-900 rounded-[15px] sm:rounded-[20px] px-2 sm:px-6 py-0.5 sm:py-2 shadow-[2px_2px_10px_0px_rgba(0,240,255,0.20)] outline outline-2 outline-offset-[-2px] outline-cyan-500">
        <div class="flex items-center gap-4 sm:gap-8 text-white">
          <div class="text-center">
            <div id="player1Name" class="text-xs sm:text-sm text-gray-300">Player 1</div>
            <div id="player1Score" class="text-xl sm:text-3xl font-bold text-cyan-400">0</div>
            <div class="w-12 sm:w-16 h-1.5 sm:h-2 bg-gray-700 rounded mt-1 sm:mt-2">
              <div id="player1Progress" class="h-full bg-cyan-400 rounded transition-all duration-300" style="width: 0%"></div>
            </div>
          </div>
          <div class="text-lg sm:text-2xl text-gray-400">:</div>
          <div class="text-center">
            <div id="player2Name" class="text-xs sm:text-sm text-gray-300">Player 2</div>
            <div id="player2Score" class="text-xl sm:text-3xl font-bold text-yellow-400">0</div>
            <div class="w-12 sm:w-16 h-1.5 sm:h-2 bg-gray-700 rounded mt-1 sm:mt-2">
              <div id="player2Progress" class="h-full bg-yellow-400 rounded transition-all duration-300" style="width: 0%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  const canvasBlock = `
    <div class="w-full flex justify-center">
      <div class="w-full max-w-[998px]">${renderPongCanvas()}</div>
    </div>`;

  const actions = `
    <div class="w-full max-w-[540px] flex gap-2 sm:gap-3 px-2 mt-3">
      <button id="backToBracket" type="button" class="flex-1 h-12 sm:h-14 px-4 sm:px-6 py-2 sm:py-3 bg-cyan-700 hover:bg-cyan-800 
              rounded-lg justify-center items-center transition-colors hidden">
        <div class="text-white text-base sm:text-lg font-bold">${i18n.t('tournament.bracket') || 'BRACKET'}</div>
      </button>
    </div>`;

  return `
    <div class="min-h-screen global-bg p-2 sm:p-4 relative flex flex-col">
      ${header}
      <div class="flex-1 flex flex-col items-center justify-center gap-3 sm:gap-6">
        ${scoreboard}
        ${canvasBlock}
        ${actions}
      </div>
    </div>
  `;
}

type PlayerRef = { id: number; name: string; avatar?: string };

export async function initRegisteredMatchGame(): Promise<void> {
  initFooter();

  const st = getInlineRegistered();
  const matchId = Number(sessionStorage.getItem('inlineRegistered.matchId') || '0');
  if (!st || !matchId) {
    navigateTo('/tournament/inline-registered/bracket');
    return;
  }

  const m = st.matches.find(x => x.id === matchId);
  if (!m || !m.player1 || !m.player2) {
    alert('Partido no válido.');
    navigateTo('/tournament/inline-registered/bracket');
    return;
  }
  const p1: PlayerRef = { id: m.player1.id, name: m.player1.name, avatar: m.player1.avatar };
  const p2: PlayerRef = { id: m.player2.id, name: m.player2.name, avatar: m.player2.avatar };

  // Set names in scoreboard
  const p1NameEl = document.getElementById('player1Name');
  const p2NameEl = document.getElementById('player2Name');
  if (p1NameEl) p1NameEl.textContent = p1.name;
  if (p2NameEl) p2NameEl.textContent = p2.name;

  // Mount canvas inside pongContainer (same approach as Local)
  setTimeout(() => {
    const container = document.getElementById('pongContainer');
    if (!container) return;
    container.innerHTML = '';
    const canvas = createResponsivePongCanvas(container);

    let ended = false;
    const s1El = document.getElementById('player1Score')!;
    const s2El = document.getElementById('player2Score')!;
    const pr1 = document.getElementById('player1Progress') as HTMLElement;
    const pr2 = document.getElementById('player2Progress') as HTMLElement;

    const onFinish = async (s1: number, s2: number) => {
      // Stop canvas from hijacking clicks
      const canvasEl = container.querySelector('canvas') as HTMLCanvasElement | null;
      if (canvasEl) canvasEl.style.pointerEvents = 'none';

      // Persist results (same as older overlay action)
      try {
        const curr = getInlineRegistered()!;
        const updated = reportLocalResult(curr, matchId, s1, s2);
        saveInlineRegistered(updated);
        await saveMatchHistory({
          player1Id: p1.id,
          player2Id: p2.id,
          player1Name: p1.name,
          player2Name: p2.name,
          score1: s1,
          score2: s2,
          mode: 'inline-registered',
          played_at: new Date().toISOString(),
          tournament_id: updated.tournamentId ?? null
        });
      } catch (e) {
        console.warn('No se pudo persistir historial remoto (se mantiene local):', e);
      }

      // Reveal action button to return to bracket
      const backBtn = document.getElementById('backToBracket');
      backBtn?.classList.remove('hidden');
      backBtn?.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        navigateTo('/tournament/inline-registered/bracket');
      }, { once: true });
    };

    function updateScore(a: number, b: number) {
      s1El.textContent = String(a);
      s2El.textContent = String(b);
      if (pr1) pr1.style.width = `${Math.min((a / GOALS_TO_WIN) * 100, 100)}%`;
      if (pr2) pr2.style.width = `${Math.min((b / GOALS_TO_WIN) * 100, 100)}%`;
      if (!ended && (a >= GOALS_TO_WIN || b >= GOALS_TO_WIN)) {
        ended = true;
        const status = document.getElementById('gameStatus');
        const winnerName = (a > b) ? p1.name : p2.name;
        if (status) {
          status.innerHTML = `${winnerName} ${i18n.t('game.wins') || 'Wins!'}`;
          status.className = 'text-green-400 text-xl font-bold text-center animate-bounce';
        }
        onFinish(a, b);
      }
    }

    initPong2dPvP(
      canvas,
      updateScore,
      { name: p1.name, avatar: p1.avatar || '' },
      { name: p2.name, avatar: p2.avatar || '' }
    );
  }, 0);
}