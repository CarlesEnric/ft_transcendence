import { navigateTo } from '../core/router';
import { renderFooter, initFooter } from '../components/global/Footer';
import i18n from '../core/i18n';
import { renderParticipantsGrid, initializeParticipantsGrid, type Participant as P1, type Tournament as T1 } from '../components/tournament/ParticipantsGrid';
import { renderOwnerControls, setupOwnerControlsEvents, canStartTournament } from '../components/tournament/OwnerControls';
import { initializeTournamentInfo } from '../components/tournament/TournamentInfo';
import { renderTournamentHeader, setupTournamentHeaderEvents } from '../components/tournament/TournamentHeader';
import { LocalTournamentService } from './LocalTournamentService';
import { saveLocalTournament, createBracketFromPlayers, type LocalPlayer } from './LocalTournamentStore';

function matchGridHeightToRightColumn() {
  const gridContainer = document.getElementById('participantsGridContainer');
  const rightColumn = document.getElementById('rightColumnContainer');
  
  if (gridContainer && rightColumn) {
    const tournamentInfo = rightColumn.querySelector('[data-component="tournament-info"]') as HTMLElement | null;
    const ownerControls = rightColumn.querySelector('[data-component="owner-controls"]') as HTMLElement | null;

    gridContainer.style.height = 'auto';
    gridContainer.style.minHeight = '0';

    const controlsEl = ownerControls; // solo owner controls en local lobby
    const docInfoTop = (tournamentInfo ? (tournamentInfo.getBoundingClientRect().top + window.pageYOffset) : (rightColumn.getBoundingClientRect().top + window.pageYOffset));
    const docControlsBottom = (controlsEl ? (controlsEl.getBoundingClientRect().bottom + window.pageYOffset) : (rightColumn.getBoundingClientRect().bottom + window.pageYOffset));

    let desiredHeight = Math.max(0, docControlsBottom - docInfoTop);
    if (!desiredHeight || isNaN(desiredHeight) || desiredHeight < 50) {
      desiredHeight = rightColumn.offsetHeight;
    }

    gridContainer.style.height = `${desiredHeight}px`;
    gridContainer.style.overflow = 'hidden';
  }
}

export function renderLocalTournamentLobby(): void {
  const app = document.getElementById('app');
  if (!app) return;

  const t = LocalTournamentService.get();
  if (!t) { navigateTo('/landing'); return; }
  const participants: P1[] = (t.participants || []).map(p => ({
    userId: p.userId,
    username: p.username,
    avatar_url: p.avatar_url
      ? (p.avatar_url.startsWith('/images/') ? p.avatar_url : `/images/${p.avatar_url}`)
      : undefined,
    joinedAt: p.joinedAt
  }));

  const tournament: T1 = {
    id: t.id,
    name: t.name,
    status: t.status,
    size: t.size,
    creator_id: t.creator_id,
    started_at: t.started_at || undefined,
    finished_at: t.finished_at || undefined,
    winner_username: t.winner_username || undefined,
    participants
  };

  const bracketReady = t.status === 'in_progress' || t.started_at;
  app.innerHTML = `
    <div class="min-h-screen global-bg p-2 sm:p-4 relative flex flex-col">
  ${renderTournamentHeader(tournament, participants, 'lobby', 'local', Boolean(bracketReady))}
      <div class="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6 max-w-7xl mx-auto w-full">
        <div class="lg:w-3/5 flex">
          <div class="bg-gray-900 rounded-[20px] shadow-[2px_2px_10px_0px_rgba(0,240,255,0.20)] outline outline-2 outline-offset-[-2px] outline-cyan-500 p-4 sm:p-6 w-full flex flex-col" 
               id="participantsGridContainer">
            ${initializeParticipantsGrid(tournament)}
          </div>
        </div>
        <div class="lg:w-2/5 flex flex-col space-y-4 sm:space-y-6" id="rightColumnContainer">
          ${initializeTournamentInfo(tournament)}
          ${renderOwnerControls(tournament, participants)}
        </div>
      </div>
      <div class="w-full flex justify-center mt-4 sm:mt-6">
        ${renderFooter()}
      </div>
    </div>
  `;
  initFooter();
  setupTournamentHeaderEvents(tournament, 'lobby', 'local', Boolean(bracketReady));

  setTimeout(() => {
    matchGridHeightToRightColumn();
    window.addEventListener('resize', matchGridHeightToRightColumn);
  }, 150);

  setupOwnerControlsEvents(
    tournament,
    async () => {
      if (!canStartTournament(participants, tournament.size)) {
        alert(i18n.t('waitingRoom.needPlayers') || 'Faltan jugadores');
        return;
      }
      const localPlayers: LocalPlayer[] = (t.participants || []).slice(0, t.size).map((p, i) => {
        let avatar = p.avatar_url || '';
        avatar = avatar.replace('/images/', '');
        return {
          id: p.userId,
          name: p.username,
          avatar: avatar || `avatar${(i % 4) + 1}.png`
        };
      });
      const state = createBracketFromPlayers({ name: t.name, size: t.size }, localPlayers);
      saveLocalTournament(state);
      navigateTo('/local-tournament/bracket');
    },
    async () => {
      if (!confirm(i18n.t('tournament.confirmCancel') || '¿Cancelar el torneo?')) return;
      LocalTournamentService.cancel();
      navigateTo('/landing');
    },
    () => {
      import('./LocalTournamentModal').then(m => m.showLocalTournamentModal());
    }
  );
}

export function cleanupLocalTournamentLobby(): void {
  window.removeEventListener('resize', matchGridHeightToRightColumn);
}