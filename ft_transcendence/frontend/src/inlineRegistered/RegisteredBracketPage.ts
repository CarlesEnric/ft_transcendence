import { initializeMatchupBracket } from '../components/tournament/MatchupBracket';
import { renderFooter, initFooter } from '../components/global/Footer';
import i18n from '../core/i18n';
import { navigateTo } from '../core/router';
import {
  getInlineRegistered,
  saveInlineRegistered,
  activateNextMatchIfNeeded,
} from './RegisteredTournamentStore';

type BracketPlayer = { id: number; name: string; avatar?: string };
type BracketMatch = {
  id: number;
  round: number;
  slot: number;
  status: 'pending' | 'in_progress' | 'finished';
  player1?: BracketPlayer | null;
  player2?: BracketPlayer | null;
  score1?: number | null;
  score2?: number | null;
  winner?: BracketPlayer | null; // opcional para el widget
};

const STORAGE_KEY = 'inlineRegistered.tournament';

export function renderRegisteredBracketPage(): string {
  const st = getInlineRegistered();
  const name = st?.config?.name ?? 'Inline Tournament';
  const finished = !!st?.finishedAt;

  return `
    <div class="min-h-screen global-bg p-2 sm:p-4 relative flex flex-col">
      <div class="w-full max-w-7xl mx-auto mb-4 sm:mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm">
            <button id="backLobby" class="text-cyan-400 hover:text-cyan-300 transition-colors">
              ← ${i18n.t('general.back') || 'Volver'}
            </button>
            <span class="text-gray-400">•</span>
            <span class="text-gray-300">${i18n.t('tournament.tournament') || 'Torneo'}</span>
            <span class="text-gray-400">•</span>
            <span class="text-white font-medium">${name}</span>
          </div>
          ${finished ? `
            <button id="exitAfterFinal" class="h-10 px-4 rounded-lg bg-cyan-200 hover:bg-cyan-300 text-teal-800 font-bold">
              ${i18n.t('game.exit') || 'EXIT'}
            </button>
          ` : ''}
        </div>
      </div>

      <div class="max-w-7xl mx-auto w-full">
        <div id="registeredBracketRoot"></div>
      </div>

      <div class="max-w-7xl mx-auto w-full mt-4 sm:mt-6">
        ${!finished ? `
          <div class="flex justify-center">
            <button id="playActiveMatch"
                    class="h-12 px-6 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-bold disabled:opacity-50"
                    disabled>
              ${(i18n.t('bracket.waiting') || 'Esperando siguiente partido')}
            </button>
          </div>
        ` : ''}
      </div>

      <div class="mt-4 sm:mt-6 max-w-7xl mx-auto w-full">
        ${renderFooter()}
      </div>
    </div>
  `;
}

export async function initRegisteredBracketPage(): Promise<void> {
  initFooter();

  // Carga + activa siguiente match si procede
  let st = getInlineRegistered();
  if (!st || !Array.isArray(st.matches) || st.matches.length === 0) {
    navigateTo('/tournament/inline-registered/lobby');
    return;
  }
  st = activateNextMatchIfNeeded(st);
  saveInlineRegistered(st);

  // Mapea datos al formato del widget
  const bracketData = {
    matches: st.matches.map(m => ({
      id: m.id,
      round: m.round,
      slot: m.slot,
      status: m.status,
      player1: m.player1 ? {
        userId: m.player1.id,
        username: m.player1.name,
        avatar: m.player1.avatar || ''
      } : null,
      player2: m.player2 ? {
        userId: m.player2.id,
        username: m.player2.name,
        avatar: m.player2.avatar || ''
      } : null,
      winner: m.winner ? {
        userId: m.winner.id,
        username: m.winner.name,
        avatar: m.winner.avatar || ''
      } : null,
      score1: m.score1 ?? null,
      score2: m.score2 ?? null,
      room_code: 'REGISTERED_INLINE'
    })),
    tournamentSize: st.config.size,
    currentRound: st.currentRound
  };

  // Pinta el bracket con el mismo componente visual que el local
  const root = document.getElementById('registeredBracketRoot');
  if (root) {
    root.innerHTML = initializeMatchupBracket(bracketData as any);
  }

  // Header actions
  document.getElementById('backLobby')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('/tournament/inline-registered/lobby');
  });

  document.getElementById('exitAfterFinal')?.addEventListener('click', () => {
    // Salida limpia tras la final
    localStorage.removeItem(STORAGE_KEY);
    navigateTo('/dashboard');
  });

  // Botón “Entrar”
  const active = st.matches.find(m => m.status === 'in_progress' && m.player1 && m.player2);
  const playBtn = document.getElementById('playActiveMatch') as HTMLButtonElement | null;

  if (playBtn) {
    if (active) {
      playBtn.disabled = false;
      playBtn.textContent = (i18n.t('bracket.join') || 'Entrar');
      playBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Lo que espera registeredMatchGame: sessionStorage con el matchId
        sessionStorage.setItem('inlineRegistered.matchId', String(active.id));
        navigateTo('/tournament/inline-registered/game');
      }, { once: true });
    } else {
      playBtn.disabled = true;
      playBtn.textContent = (i18n.t('bracket.waiting') || 'Esperando siguiente partido');
    }
  }
}