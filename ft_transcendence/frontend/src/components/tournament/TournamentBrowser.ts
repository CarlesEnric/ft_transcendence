import i18n from '../../core/i18n';
import { navigateTo } from '../../core/router';
import { getState } from '../../core/state';

type TournamentRow = {
  id: number;
  name: string;
  status: 'planned'|'open'|'in_progress'|'finished';
  size: 4|8;
  created_at: string;
  participants: number;
  seats_left: number;
  creator_id?: number;
  is_participant?: boolean;
};

let cleanupFns: Array<() => void> = [];

export function renderTournamentBrowser(): string {
  return `
  <div id="tournamentBrowser" class="fixed inset-0 z-[9998] flex items-center justify-center p-3">
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" data-close></div>
    <div class="relative w-full max-w-[900px] max-h-[90vh] overflow-y-auto
                bg-gray-900 rounded-2xl shadow-[0_0_30px_rgba(255,215,0,0.25)]
                outline outline-2 outline-offset-[-2px] outline-yellow-500">
      <div class="sticky top-0 bg-gray-900/95 backdrop-blur px-4 sm:px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">🏆</div>
          <div>
            <div class="text-white text-lg font-bold">${i18n.t('tournament.availableTitle') || 'Torneos disponibles'}</div>
            <div class="text-gray-400 text-xs sm:text-sm">${i18n.t('tournament.availableSubtitle') || 'Únete a un torneo o crea uno nuevo'}</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button id="tbRefresh" class="h-10 px-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm">↻ ${i18n.t('common.refresh') || 'Actualizar'}</button>
          <button id="tbCreate" class="h-10 px-4 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-bold">${i18n.t('tournament.createNew') || 'Crear torneo'}</button>
          <button id="tbClose" class="w-10 h-10 rounded-full bg-red-500 hover:bg-red-700 text-white text-xl leading-none">×</button>
        </div>
      </div>
      <div id="tbList" class="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4"></div>
      <div class="sticky bottom-0 bg-gray-900/95 backdrop-blur px-4 sm:px-6 py-3 border-t border-gray-800 text-right">
        <button id="tbCloseBottom" class="h-10 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-white">${i18n.t('common.close') || 'Cerrar'}</button>
      </div>
    </div>
  </div>
  `;
}

function card(t: TournamentRow): string {
  const statusLabel =
    t.status === 'planned' ? (i18n.t('tournament.status.planned') || 'Planificado') :
    t.status === 'open' ? (i18n.t('tournament.status.open') || 'Abierto') :
    t.status === 'in_progress' ? (i18n.t('tournament.status.playing') || 'En curso') :
    (i18n.t('tournament.status.finished') || 'Finalizado');
  
  const me = (getState() as any)?.user;
  const isCreator = me && t.creator_id === me.id;
  const isParticipant = t.is_participant || false;
  const canJoin = (t.status === 'planned' || t.status === 'open') && t.seats_left > 0 && !isParticipant;
  
  // Texto del botón según el estado
  let joinButtonText = i18n.t('tournament.join') || 'Unirme';
  if (isCreator) {
    joinButtonText = i18n.t('tournament.manage') || 'Gestionar';
  } else if (isParticipant) {
    joinButtonText = i18n.t('tournament.joined') || 'Ya inscrito';
  }
  
  return `
  <div class="rounded-xl border border-gray-800 bg-gray-850 p-4 flex flex-col gap-3">
    <div class="flex items-start justify-between gap-3">
      <div>
        <div class="text-white font-bold text-base">${t.name} ${isCreator ? '👑' : ''}</div>
        <div class="text-xs text-gray-400">${new Date(t.created_at).toLocaleString()}</div>
      </div>
      <div class="px-2 py-1 rounded-md text-xs
        ${t.status==='open'?'bg-emerald-600/20 text-emerald-300':
          t.status==='planned'?'bg-yellow-600/20 text-yellow-300':
          t.status==='in_progress'?'bg-blue-600/20 text-blue-300':'bg-gray-600/20 text-gray-300'}">
        ${statusLabel}
      </div>
    </div>
    <div class="text-sm text-gray-300 flex items-center gap-3">
      <span>👥 ${t.participants}/${t.size}</span>
      <span>•</span>
      <span>${i18n.t('tournament.seatsLeft') || 'Plazas libres'}: ${t.seats_left}</span>
    </div>
    <div class="mt-2 flex gap-2">
      <button class="tbView h-9 px-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm" data-id="${t.id}">
        ${i18n.t('tournament.view') || 'Ver'}
      </button>
      <button class="tbJoin h-9 px-3 rounded-lg ${canJoin ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 
        isParticipant ? 'bg-blue-600/30 text-blue-300 cursor-default' : 'bg-gray-700 text-gray-300 cursor-not-allowed'} text-sm"
              data-id="${t.id}" ${!canJoin ? 'disabled' : ''}>
        ${joinButtonText}
      </button>
    </div>
  </div>
  `;
}

async function fetchTournaments(): Promise<TournamentRow[]> {
  const res = await fetch('/api/matches/tournaments', { credentials: 'include' });
  if (!res.ok) throw new Error('Listado de torneos falló');
  const data = await res.json();
  return (data?.items ?? []) as TournamentRow[];
}

async function renderList(): Promise<void> {
  const container = document.getElementById('tbList');
  if (!container) return;
  container.innerHTML = `
    <div class="col-span-full flex items-center justify-center py-8 text-gray-300">
      <span class="inline-block w-6 h-6 border-2 border-white/50 border-t-transparent rounded-full animate-spin mr-2"></span>
      ${i18n.t('common.loading') || 'Cargando...'}
    </div>
  `;
  try {
    const items = await fetchTournaments();
    if (!items.length) {
      container.innerHTML = `
        <div class="col-span-full text-center text-gray-300 py-12">
          <div class="text-3xl mb-2">🕳️</div>
          <div>${i18n.t('tournament.none') || 'No hay torneos disponibles'}</div>
        </div>
      `;
      return;
    }
    container.innerHTML = items.map(card).join('');
    bindRowActions();
  } catch {
    container.innerHTML = `
      <div class="col-span-full text-center text-red-300 py-12">
        <div class="text-3xl mb-2">⚠️</div>
        <div>${i18n.t('errors.fetch') || 'No se pudo obtener el listado.'}</div>
      </div>
    `;
  }
}

function bindRowActions() {
  document.querySelectorAll<HTMLButtonElement>('.tbJoin').forEach(btn => {
    const h = async () => {
      const id = Number(btn.dataset.id);
      btn.disabled = true;
      try {
        const res = await fetch(`/api/matches/tournaments/${id}/join`, {
          method: 'POST',
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Join falló');
        closeTournamentBrowser();
        navigateTo(`/tournaments/${id}`);
      } catch {
        alert(i18n.t('tournament.joinError') || 'No se pudo unir al torneo');
      } finally {
        btn.disabled = false;
      }
    };
    btn.addEventListener('click', h);
    cleanupFns.push(() => btn.removeEventListener('click', h));
  });

  document.querySelectorAll<HTMLButtonElement>('.tbView').forEach(btn => {
    const h = () => {
      const id = Number(btn.dataset.id);
      closeTournamentBrowser();
      navigateTo(`/tournaments/${id}`);
    };
    btn.addEventListener('click', h);
    cleanupFns.push(() => btn.removeEventListener('click', h));
  });
}

function bindFrameActions() {
  const closeAll = () => closeTournamentBrowser();
  const refresh = () => renderList();
  const create = () => {
    closeTournamentBrowser();
    import('../dashboard/TournamentModal').then(m => m.showTournamentModal());
  };
  const closeBtn = document.getElementById('tbClose');
  const closeBtn2 = document.getElementById('tbCloseBottom');
  const refreshBtn = document.getElementById('tbRefresh');
  const createBtn = document.getElementById('tbCreate');
  const backdrop = document.querySelector('#tournamentBrowser [data-close]');
  closeBtn?.addEventListener('click', closeAll);
  closeBtn2?.addEventListener('click', closeAll);
  refreshBtn?.addEventListener('click', refresh);
  createBtn?.addEventListener('click', create);
  backdrop?.addEventListener('click', closeAll);
  cleanupFns.push(() => closeBtn?.removeEventListener('click', closeAll));
  cleanupFns.push(() => closeBtn2?.removeEventListener('click', closeAll));
  cleanupFns.push(() => refreshBtn?.removeEventListener('click', refresh));
  cleanupFns.push(() => createBtn?.removeEventListener('click', create));
  cleanupFns.push(() => backdrop?.removeEventListener('click', closeAll));
}

export function showTournamentBrowser(): void {
  closeTournamentBrowser();
  const hostId = 'tournamentBrowserHost';
  let host = document.getElementById(hostId);
  if (!host) {
    host = document.createElement('div');
    host.id = hostId;
    document.body.appendChild(host);
  }
  host.innerHTML = renderTournamentBrowser();
  document.body.style.overflow = 'hidden';
  bindFrameActions();
  renderList();
}

export function closeTournamentBrowser(): void {
  cleanupFns.forEach(fn => { try { fn(); } catch {} });
  cleanupFns = [];
  const host = document.getElementById('tournamentBrowserHost');
  if (host) host.remove();
  document.body.style.overflow = '';
}