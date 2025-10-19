import { renderFooter, initFooter } from '../components/global/Footer';
import { navigateTo } from '../core/router';
import { renderParticipantsGrid, initializeParticipantsGrid, type Participant as P1, type Tournament as T1 } from '../components/tournament/ParticipantsGrid';
import { renderOwnerControls, setupOwnerControlsEvents, canStartTournament } from '../components/tournament/OwnerControls';
import { initializeTournamentInfo } from '../components/tournament/TournamentInfo';
import { renderTournamentHeader, setupTournamentHeaderEvents } from '../components/tournament/TournamentHeader';
import {
  getInlineRegistered,
  saveInlineRegistered,
  createBracketFromPlayers,
  normalizeAvatar,
  type RegisteredPlayer
} from './RegisteredTournamentStore';

export function renderRegisteredTournamentLobby(): string {
  return `
    <div class="min-h-screen global-bg p-2 sm:p-4 relative flex flex-col">
      <div id="registeredLobbyRoot" class="flex-1"></div>
      <div class="mt-4 sm:mt-6 max-w-7xl mx-auto w-full">${renderFooter()}</div>
    </div>
  `;
}

export async function initRegisteredTournamentLobby(): Promise<void> {
  initFooter();

  const st = getInlineRegistered();
  if (!st) {
    navigateTo('/tournament/inline-registered/setup');
    return;
  }
  const participants: P1[] = (st.selectedParticipants || []).map(p => ({
    userId: p.userId,
    username: p.username,
    avatar_url: normalizeAvatar(p.avatar)
  }));

  const tournament: T1 = {
    id: 0,
    name: st.config.name,
    status: st.finishedAt ? 'finished' : 'open',
    size: st.config.size,
    creator_id: 0,
    started_at: undefined,
    finished_at: st.finishedAt,
    winner_username: undefined,
    participants
  };
  const root = document.getElementById('registeredLobbyRoot')!;
  root.innerHTML = `
    ${renderTournamentHeader(tournament, participants, 'lobby')}
    <div class="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6 max-w-7xl mx-auto w-full">
      <div class="lg:w-3/5 flex">
        <div
          class="bg-gray-900 rounded-[20px] shadow-[2px_2px_10px_0px_rgba(0,240,255,0.20)]
                 outline outline-2 outline-offset-[-2px] outline-cyan-500 p-4 sm:p-6 w-full flex flex-col"
          id="participantsGridContainer">
          ${initializeParticipantsGrid(tournament)}
        </div>
      </div>
      <div class="lg:w-2/5 flex flex-col space-y-4 sm:space-y-6" id="rightColumnContainer">
        ${initializeTournamentInfo(tournament)}
        ${renderOwnerControls(tournament, participants)}
      </div>
    </div>
  `;
  setupTournamentHeaderEvents(tournament, 'lobby');
  const grid = document.getElementById('participantsGridContainer');
  if (grid) grid.innerHTML = renderParticipantsGrid(tournament);
  setupOwnerControlsEvents(
    tournament,
    async () => {
      if (!canStartTournament(participants, tournament.size)) {
        alert('Faltan jugadores'); return;
      }

      const st = getInlineRegistered();
      const already = st && Array.isArray(st.matches) && st.matches.length > 0;

      if (!already) {
        const players: RegisteredPlayer[] = (tournament.participants || []).map(p => ({
          id: p.userId,
          name: p.username,
          avatar: normalizeAvatar(p.avatar_url)
        }));
        createBracketFromPlayers({ name: tournament.name || 'Inline', size: tournament.size }, players);
      }
      navigateTo('/tournament/inline-registered/bracket');
    },
    async () => {
      localStorage.removeItem('inlineRegistered.tournament');
      navigateTo('/dashboard');
    },
    () => {
      navigateTo('/tournament/inline-registered/setup');
    }
  );
}