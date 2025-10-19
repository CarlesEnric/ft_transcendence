import { navigateTo } from '../core/router';
import { initPong2dPvP } from '../components/game/Pong2dPvP';
import { createResponsivePongCanvas } from '../components/game/pongCanvasUtils';
import { renderFooter, initFooter } from '../components/global/Footer';
import { getInlineRegistered, saveInlineRegistered, reportLocalResult } from './RegisteredTournamentStore';
import { saveMatchHistory } from './RegisteredTournamentService';

const GOALS_TO_WIN = 5;

export function renderRegisteredMatchGame(): string {
  return `
  <div class="min-h-screen p-6 global-bg">
    <div class="max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-4">
        <h2 id="matchTitle" class="text-xl text-white font-bold">Match</h2>
        <button id="backBracket" class="px-3 py-1 bg-gray-700 text-white rounded">Back to bracket</button>
      </div>
      <div class="bg-gray-900 rounded-xl border border-gray-700">
        <div class="p-3">
          <div class="w-full flex justify-center mb-2">
            <div class="bg-gray-900 rounded-[15px] px-4 py-2 outline outline-2 outline-cyan-500">
              <div class="flex items-center gap-8 text-white">
                <div class="text-center">
                  <div id="p1Name" class="text-xs text-gray-300">Player 1</div>
                  <div id="p1Score" class="text-3xl font-bold text-cyan-400">0</div>
                  <div class="w-16 h-2 bg-gray-700 rounded mt-2">
                    <div id="p1Progress" class="h-full bg-cyan-400 rounded transition-all duration-300" style="width:0%"></div>
                  </div>
                </div>
                <div class="text-2xl text-gray-400">:</div>
                <div class="text-center">
                  <div id="p2Name" class="text-xs text-gray-300">Player 2</div>
                  <div id="p2Score" class="text-3xl font-bold text-yellow-400">0</div>
                  <div class="w-16 h-2 bg-gray-700 rounded mt-2">
                    <div id="p2Progress" class="h-full bg-yellow-400 rounded transition-all duration-300" style="width:0%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div id="gameMount" class="w-full max-w-[998px] aspect-[16/10] mx-auto bg-gray-950 rounded-[20px] overflow-hidden flex items-center justify-center relative">
            <div class="text-gray-400">Loading game…</div>
          </div>
        </div>
      </div>
      <div class="mt-4">${renderFooter()}</div>
    </div>
  </div>`;
}

type PlayerRef = { id: number; name: string; avatar?: string };

export async function initRegisteredMatchGame(): Promise<void> {
  document.getElementById('backBracket')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('/tournament/inline-registered/bracket');
  });
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
  const match = m;
  const p1: PlayerRef = { id: m.player1.id, name: m.player1.name, avatar: m.player1.avatar };
  const p2: PlayerRef = { id: m.player2.id, name: m.player2.name, avatar: m.player2.avatar };

  (document.getElementById('matchTitle') as HTMLElement).textContent = `${p1.name} vs ${p2.name}`;
  (document.getElementById('p1Name') as HTMLElement).textContent = p1.name;
  (document.getElementById('p2Name') as HTMLElement).textContent = p2.name;

  const mount = document.getElementById('gameMount')!;
  mount.innerHTML = '';
  const canvas = createResponsivePongCanvas(mount);

  let ended = false;
  const p1ScoreEl = document.getElementById('p1Score')!;
  const p2ScoreEl = document.getElementById('p2Score')!;
  const p1Prog = document.getElementById('p1Progress') as HTMLElement;
  const p2Prog = document.getElementById('p2Progress') as HTMLElement;

  function updateScore(s1: number, s2: number) {
    p1ScoreEl.textContent = String(s1);
    p2ScoreEl.textContent = String(s2);
    p1Prog.style.width = `${Math.min((s1 / GOALS_TO_WIN) * 100, 100)}%`;
    p2Prog.style.width = `${Math.min((s2 / GOALS_TO_WIN) * 100, 100)}%`;
    if (!ended && (s1 >= GOALS_TO_WIN || s2 >= GOALS_TO_WIN)) {
      ended = true;
      showEndOverlay(s1, s2);
    }
  }

  function showEndOverlay(s1: number, s2: number) {
    const overlay = document.createElement('div');
    overlay.className = 'absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-10';
    overlay.innerHTML = `
      <div class="text-3xl font-bold text-cyan-300 mb-4">${s1 > s2 ? p1.name : p2.name} wins!</div>
      <div class="flex gap-6">
        <button id="playAgainBtn" class="px-6 py-3 bg-cyan-700 text-white font-bold rounded-lg hover:bg-cyan-800 transition">Play Again</button>
        <button id="homeBtn" class="px-6 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-800 transition">Back to bracket</button>
      </div>`;
    mount.appendChild(overlay);

    document.getElementById('playAgainBtn')?.addEventListener('click', () => {
      navigateTo('/tournament/inline-registered/game');
    });

    document.getElementById('homeBtn')?.addEventListener('click', async () =>
    {
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
      } finally {
        navigateTo('/tournament/inline-registered/bracket');
      }
    });
  }
  initPong2dPvP(
    canvas,
    updateScore,
    { name: p1.name, avatar: p1.avatar || '' },
    { name: p2.name, avatar: p2.avatar || '' }
  );
}