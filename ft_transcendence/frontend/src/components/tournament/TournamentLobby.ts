import { navigateTo } from '../../core/router';
import { getState } from '../../core/state';
import { renderFooter, initFooter } from '../global/Footer';
import i18n from '../../core/i18n';
import { renderParticipantsGrid, initializeParticipantsGrid, stopTimeUpdates, type Participant, type Tournament } from './ParticipantsGrid';
import { renderOwnerControls, setupOwnerControlsEvents } from './OwnerControls';
import { initializeTournamentInfo } from './TournamentInfo';
import { renderTournamentHeader, setupTournamentHeaderEvents } from './TournamentHeader';

function matchGridHeightToRightColumn() {
  const gridContainer = document.getElementById('participantsGridContainer');
  const rightColumn = document.getElementById('rightColumnContainer');
  
  if (gridContainer && rightColumn) {
    const tournamentInfo = rightColumn.querySelector('[data-component="tournament-info"]') as HTMLElement | null;
    const ownerControls = rightColumn.querySelector('[data-component="owner-controls"]') as HTMLElement | null;
    const playerControls = rightColumn.querySelector('[data-component="player-controls"]') as HTMLElement | null;

    gridContainer.style.height = 'auto';
    gridContainer.style.minHeight = '0';

    const infoTop = tournamentInfo ? tournamentInfo.getBoundingClientRect().top : rightColumn.getBoundingClientRect().top;
    const controlsEl = ownerControls || playerControls;
    const controlsBottom = controlsEl ? controlsEl.getBoundingClientRect().bottom : rightColumn.getBoundingClientRect().bottom;

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
function subscribeTournamentEvents(tournamentId: number) {
  (window as any).__tse?.close?.();

  const es = new EventSource(`/api/matches/tournaments/${tournamentId}/events`, { withCredentials: true });
  (window as any).__tse = es;

  es.onmessage = async (e) => {
    try {
      const data = JSON.parse(e.data);
      if (data?.type === 'tournament_status') {
        if (data.status === 'in_progress') {
          navigateTo(`/tournaments/${tournamentId}/bracket`);
        } else if (data.status === 'cancelled') {
          navigateTo('/dashboard');
        }
      }
      if (data?.type === 'tournament_joined' || data?.type === 'tournament_left') {
        try {
          const res = await fetch(`/api/matches/tournaments/${tournamentId}`, { credentials: 'include' });
          if (res.ok) {
            const t = (await res.json()) as Tournament;
            updateParticipantsContent(t);
            updateRightColumnContent(t, t.participants || [], isCreator(t));
            setTimeout(() => matchGridHeightToRightColumn(), 50);
          }
        } catch {}
      }
    } catch {}
  };

  es.addEventListener('ping', () => {});
  es.onerror = () => {
  };

  window.addEventListener('beforeunload', () => es.close(), { once: true });
}

function isCreator(t: Tournament): boolean {
  const me = (getState() as any)?.user;
  return !!(me && t?.creator_id === me.id);
}

export async function renderTournamentLobby(tournamentId: number) {
  const host = document.getElementById('main-content') || document.getElementById('app');
  if (!host) return;
  host.innerHTML = `<div class="p-6 text-white">Cargando torneo…</div>`;

  let t: Tournament | null = null;
  try {
    const res = await fetch(`/api/matches/tournaments/${tournamentId}`, { credentials: 'include' });
    t = await res.json();
    if (!res.ok) throw new Error((t as any)?.error || 'Error torneo');
  } catch (e: any) {
    host.innerHTML = `<div class="p-6 text-red-300">Error cargando torneo: ${e?.message || e}</div>`;
    return;
  }

  if (!t) return;

  if (t.status === 'cancelled') {
    navigateTo('/dashboard');
    return;
  }
  if (t.status === 'in_progress') {
    navigateTo(`/tournaments/${t.id}/bracket`);
    return;
  }

  const participants = t.participants || [];
  const amCreator = isCreator(t);

  host.innerHTML = `
    <div class="min-h-screen global-bg p-2 sm:p-4 relative flex flex-col">
      ${renderTournamentHeader(t, participants, 'lobby')}

      <div class="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6 max-w-7xl mx-auto w-full">
        <div class="lg:w-3/5 flex">
          <div class="bg-gray-900 rounded-[20px] shadow-[2px_2px_10px_0px_rgba(0,240,255,0.20)] outline outline-2 outline-offset-[-2px] outline-cyan-500 p-4 sm:p-6 w-full flex flex-col" 
               id="participantsGridContainer">
            ${initializeParticipantsGrid(t)}
          </div>
        </div>

        <div class="lg:w-2/5 flex flex-col space-y-4 sm:space-y-6" id="rightColumnContainer">
          ${initializeTournamentInfo(t)}
          ${amCreator
            ? renderOwnerControls(t, participants)
            : `
              <div data-component="player-controls" class="bg-gray-900 rounded-[15px] shadow-[2px_2px_10px_0px_rgba(34,197,94,0.20)] outline outline-2 outline-offset-[-2px] outline-green-400 p-4 sm:p-5">
                <h3 class="text-white text-lg font-bold mb-4 flex items-center gap-2">
                  <span class="text-green-400">🎮</span>
                  ${i18n.t('waitingRoom.playerControls') || 'Controles de Jugador'}
                </h3>
                <div class="space-y-3">
                  <div class="bg-green-900/20 border border-green-600/50 rounded-lg p-3">
                    <div class="flex items-center gap-2 mb-2">
                      <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span class="text-green-400 font-medium text-sm">${i18n.t('waitingRoom.readyToPlay') || 'Listo para jugar'}</span>
                    </div>
                    <div class="text-gray-300 text-xs">${i18n.t('waitingRoom.waitingForOwner') || 'Esperando a que el organizador inicie el torneo'}</div>
                  </div>
                  <button id="btnLeave" class="w-full h-10 bg-red-600/30 hover:bg-red-700/50 text-red-400 font-medium rounded-lg transition-colors border border-red-600/50">
                    ${i18n.t('waitingRoom.leaveTournament') || 'Salir del Torneo'}
                  </button>
                </div>
              </div>
            `}
        </div>
      </div>

      <div class="mt-4 sm:mt-6 max-w-7xl mx-auto w-full">
        ${renderFooter()}
      </div>
    </div>
  `;

  initFooter();
  setupTournamentHeaderEvents(t, 'lobby');

  setTimeout(() => {
    matchGridHeightToRightColumn();
    window.addEventListener('resize', matchGridHeightToRightColumn);
  }, 150);

  if (amCreator) {
    setupOwnerControlsEvents(
      t,
      async () => {
        try {
          const res = await fetch(`/api/matches/tournaments/${t.id}/start`, { method: 'POST', credentials: 'include' });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error || res.statusText);
          navigateTo(`/tournaments/${t.id}/bracket`);
        } catch (e: any) {
          alert(e?.message || 'No se pudo iniciar');
        }
      },
      async () => {
        if (!confirm(i18n.t('tournament.confirmCancel') || '¿Cancelar el torneo para todos?')) return;
        try {
          const res = await fetch(`/api/matches/tournaments/${t.id}/cancel`, { method: 'POST', credentials: 'include' });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error || res.statusText);
          navigateTo('/dashboard');
        } catch (e: any) {
          alert(e?.message || 'No se pudo cancelar');
        }
      },
      async () => {
        const { showTournamentModal } = await import('../dashboard/TournamentModal');
        showTournamentModal(true, {
          id: t.id, name: t.name, size: t.size, status: t.status
        });
      }
    );
  }
  subscribeTournamentEvents(t.id);

  document.getElementById('btnLeave')?.addEventListener('click', async () => {
    if (!confirm(i18n.t('tournament.confirmLeave') || '¿Salir del torneo?')) return;
    try {
      await fetch(`/api/matches/tournaments/${t!.id}/leave`, { method: 'POST', credentials: 'include' });
    } catch {}
    navigateTo('/dashboard');
  });
}

function updateParticipantsContent(tournament: Tournament) {
  const container = document.getElementById('participantsGridContainer');
  if (container) {
    container.innerHTML = initializeParticipantsGrid(tournament);
    setTimeout(() => matchGridHeightToRightColumn(), 50);
  }
}

function updateRightColumnContent(tournament: Tournament, participants: Participant[], amCreator: boolean) {
  const container = document.getElementById('rightColumnContainer');
  if (!container) return;
  container.innerHTML = `
    ${initializeTournamentInfo(tournament)}
    ${amCreator
      ? renderOwnerControls(tournament, participants)
      : container.querySelector('[data-component="player-controls"]')?.outerHTML || ''}
  `;
  setTimeout(() => matchGridHeightToRightColumn(), 50);
}
export function cleanupTournamentLobby(): void {
  try { (window as any).__tse?.close?.(); } catch {}
  stopTimeUpdates();
  window.removeEventListener('resize', matchGridHeightToRightColumn);
}