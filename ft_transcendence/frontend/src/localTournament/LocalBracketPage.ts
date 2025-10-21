import { initializeMatchupBracket } from '../components/tournament/MatchupBracket';
import { renderFooter, initFooter } from '../components/global/Footer';
import i18n from '../core/i18n';
import { navigateTo } from '../core/router';
import {
  getLocalTournament,
  saveLocalTournament,
  activateNextMatchIfNeeded,
  LocalMatch
} from './LocalTournamentStore';

//  Helper to cleanup all local tournament data and cookies
function cleanupLocalTournament(): void {
  
  // Remove localStorage items
  localStorage.removeItem('localTournament.prefs');
  localStorage.removeItem('localTournament.active');
  localStorage.removeItem('localTournament.bracket');
  localStorage.removeItem('localTournament');
  localStorage.removeItem('currentMatch');
  localStorage.removeItem('gameRoom');
  localStorage.removeItem('currentTournament');
  
  
  // Clear any game-related cookies
  const cookies = document.cookie.split(';');
  cookies.forEach(cookie => {
    const name = cookie.split('=')[0].trim();
    if (name.includes('tournament') || name.includes('game') || name.includes('match')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  });
  
}

export function renderLocalBracketPage(): void {
  const app = document.getElementById('app')!;
  let state = getLocalTournament();
  if (!state) { navigateTo('/local-tournament/lobby'); return; }
  state = activateNextMatchIfNeeded(state);
  saveLocalTournament(state);

  const active = state.matches.find(m => m.status === 'in_progress');
  const showExit = !!state.finishedAt;

  const bracketData = {
    matches: state.matches.map(m => ({
      id: m.id,
      round: m.round,
      slot: m.slot,
      status: m.status,
      player1: m.player1 ? { userId: m.player1.id, username: m.player1.name, avatar: `/images/${m.player1.avatar}`, avatar_url: `/images/${m.player1.avatar}` } : null,
      player2: m.player2 ? { userId: m.player2.id, username: m.player2.name, avatar: `/images/${m.player2.avatar}`, avatar_url: `/images/${m.player2.avatar}` } : null,
      winner: m.winner ? { userId: m.winner.id, username: m.winner.name, avatar: `/images/${m.winner.avatar}`, avatar_url: `/images/${m.winner.avatar}` } : null,
      score1: m.score1 ?? null,
      score2: m.score2 ?? null,
      room_code: 'LOCAL'
    })),
    tournamentSize: state.config.size,
    currentRound: state.currentRound,
    winner: state.winner ? { userId: state.winner.id, username: state.winner.name, avatar: `/images/${state.winner.avatar}`, avatar_url: `/images/${state.winner.avatar}` } : null,
    showActions: false
  };
  app.innerHTML = `
    <div class="min-h-screen global-bg p-2 sm:p-4 relative flex flex-col">
      <div class="flex-1 flex flex-col">
        <div class="w-full max-w-7xl mx-auto mb-4 sm:mb-6">
          <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm">
            <button id="backLanding" class="text-cyan-400 hover:text-cyan-300 transition-colors">
              ← ${i18n.t('general.back') || 'Volver'}
            </button>
            <span class="text-gray-400">•</span>
            <span class="text-gray-300">${i18n.t('tournament.tournament') || 'Torneo'}</span>
            <span class="text-gray-400">•</span>
            <span class="text-white font-medium">${state.config.name}</span>
          </div>
          ${showExit ? `
            <button id="exitAfterFinal" class="h-10 px-4 rounded-lg bg-cyan-200 hover:bg-cyan-300 text-teal-800 font-bold">
              ${i18n.t('game.exit') || 'EXIT'}
            </button>
          ` : ''}
          </div>
        </div>
        <div class="max-w-7xl mx-auto w-full">
          ${initializeMatchupBracket(bracketData as any)}
        </div>
        <div class="max-w-7xl mx-auto w-full mt-4 sm:mt-6">
          ${!showExit ? `
            <div class="flex justify-center">
              <button id="playActiveMatch" 
                      class="h-12 px-6 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white font-bold disabled:opacity-50"
                      ${active ? '' : 'disabled'}>
                ${active ? (i18n.t('bracket.join') || 'Entrar') : (i18n.t('bracket.waiting') || 'Esperando siguiente partido')}
              </button>
            </div>
          ` : ''}
        </div>
      </div>
      <div class="w-full flex justify-center">
        ${renderFooter()}
      </div>
    </div>
  `;
  initFooter();
  
  // IMPORTANT: Register event listeners with proper debugging
  const backBtn = document.getElementById('backLanding');
  const exitBtn = document.getElementById('exitAfterFinal');
  
  
  backBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    cleanupLocalTournament();
    navigateTo('/local-tournament/lobby');
  });
  
  exitBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    cleanupLocalTournament();
    navigateTo('/');
  });
  const playBtn = document.getElementById('playActiveMatch') as HTMLButtonElement | null;
  if (playBtn && active) {
    playBtn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(`/local-tournament/match?matchId=${active.id}`);
    }, { once: true });
  }
}