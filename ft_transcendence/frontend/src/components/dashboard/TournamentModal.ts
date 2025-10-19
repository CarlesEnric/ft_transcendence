import i18n from '../../core/i18n';
import { navigateTo } from '../../core/router';

type TournamentData = {
  id?: number;
  name: string;
  size: 4 | 8;
  status?: string;
};

export const renderTournamentModal = (editMode = false, initialData?: TournamentData): string => `
  <div id="tournamentModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" id="tournamentModalBackdrop"></div>
    <div class="relative w-full max-w-[560px] bg-gray-900 rounded-2xl outline outline-2 outline-yellow-400 p-6">
      <button id="closeTournamentModal" class="absolute top-3 right-3 w-8 h-8 bg-red-600 text-white rounded-full">×</button>
      <h2 class="text-2xl font-bold text-white mb-4">🏆 ${editMode ? 
        (i18n.t('tournament.editTitle') || 'Editar Torneo') : 
        (i18n.t('tournament.createTitle') || 'Crear Torneo')}</h2>
      <form id="tournamentForm" class="space-y-5">
        <div>
          <label class="text-white text-sm block mb-2">${i18n.t('tournament.nameLabel') || 'Nombre del Torneo'}</label>
          <input id="tournamentName" name="tournamentName" maxlength="50" required
                 class="w-full h-11 px-3 rounded bg-white text-black" 
                 placeholder="Mi Torneo" 
                 value="${initialData?.name || ''}" />
        </div>
        <div>
          <label class="text-white text-sm block mb-2">${i18n.t('tournament.playersLabel') || 'Número de Jugadores'}</label>
          <select id="size" name="size" required class="w-full h-11 px-3 rounded bg-white text-black">
            <option value="4" ${initialData?.size === 4 ? 'selected' : ''}>4 jugadores</option>
            <option value="8" ${initialData?.size === 8 ? 'selected' : ''}>8 jugadores</option>
          </select>
          <p class="text-xs text-gray-400 mt-1">
            ${editMode ? '* Solo se puede cambiar si no hay más participantes que el nuevo límite' : '* Solo 4 u 8'}
          </p>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="button" id="cancelTournament" class="flex-1 h-11 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">
            ${i18n.t('common.cancel') || 'Cancelar'}
          </button>
          <button type="submit" id="createTournament" class="flex-1 h-11 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg">
            ${editMode ? (i18n.t('common.save') || 'Guardar') : (i18n.t('tournament.create') || 'Crear')}
          </button>
        </div>
      </form>
    </div>
  </div>
`;

let _cleanup: (() => void) | null = null;

function extractIdFromLocation(loc: string | null): number | null {
  if (!loc) return null;
  const m = loc.match(/tournaments\/(\d+)/);
  if (!m) return null;
  const id = Number(m[1]);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function coerceId(value: unknown): number | null {
  const n = Number((value as any));
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function getCreatedTournamentId(res: Response): Promise<number | null> {
  const loc = res.headers.get('Location') || res.headers.get('location');
  const fromLoc = extractIdFromLocation(loc);
  if (fromLoc) return fromLoc;
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    return null;
  }

  const candidates = [
    data?.id,
    data?.tournament?.id,
    data?.data?.id,
    data?.result?.id
  ];

  for (const c of candidates) {
    const id = coerceId(c);
    if (id) return id;
  }

  return null;
}

export function showTournamentModal(editMode = false, tournamentData?: TournamentData): void {
  closeTournamentModal();
  const container = document.createElement('div');
  container.id = 'tournamentModalContainer';
  container.innerHTML = renderTournamentModal(editMode, tournamentData);
  document.body.appendChild(container);
  document.body.style.overflow = 'hidden';
  
  const close = () => closeTournamentModal();
  const closeBtn = container.querySelector('#closeTournamentModal');
  const backdrop = container.querySelector('#tournamentModalBackdrop');
  const cancelBtn = container.querySelector('#cancelTournament');
  const form = container.querySelector('#tournamentForm') as HTMLFormElement;
  
  const onSubmit = async (e: Event) => {
    e.preventDefault();
    const name = (form.querySelector('#tournamentName') as HTMLInputElement).value.trim();
    const size = parseInt((form.querySelector('#size') as HTMLSelectElement).value, 10) as 4 | 8;
    
    if (!name) {
      alert(i18n.t('tournament.nameRequired') || 'El nombre del torneo es obligatorio');
      return;
    }
    
    try {
      if (editMode && tournamentData?.id) {
        const updateData: any = { name };
        if (size !== tournamentData.size) updateData.size = size;
        
        const res = await fetch(`/api/matches/tournaments/${tournamentData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(updateData)
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || 'Error al actualizar el torneo');
        }
        
        alert(i18n.t('tournament.updated') || 'Torneo actualizado exitosamente!');
        close();

        const currentPath = window.location.pathname;
        const tournamentMatch = currentPath.match(/\/tournaments\/(\d+)/);
        if (tournamentMatch) {
          const tournamentId = parseInt(tournamentMatch[1]);
          import('../tournament/TournamentLobby').then(mod => {
            mod.renderTournamentLobby(tournamentId);
          });
        }
        
      } else {
        if (size !== 4 && size !== 8) { 
          alert('Solo 4 u 8 jugadores permitidos'); 
          return; 
        }

        const res = await fetch('/api/matches/tournaments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name, size })
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || 'Error al crear el torneo');
        }

        const createdId = await getCreatedTournamentId(res);
        if (!createdId) {
          console.warn('respuesta del servidor sin ID de torneo');
          throw new Error('respuesta del servidor sin ID de torneo');
        }

        try {
          await fetch(`/api/matches/tournaments/${createdId}/join`, {
            method: 'POST',
            credentials: 'include'
          });
        } catch {}

        try {
          const { closeTournamentBrowser } = await import('../tournament/TournamentBrowser');
          closeTournamentBrowser();
        } catch {}

        close();
        navigateTo(`/tournaments/${createdId}`);
      }
    } catch (error: any) {
      alert(error?.message || (editMode ? 'Error al actualizar el torneo' : 'Error al crear el torneo'));
    }
  };
  
  closeBtn?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);
  cancelBtn?.addEventListener('click', close);
  form?.addEventListener('submit', onSubmit);
  
  _cleanup = () => {
    closeBtn?.removeEventListener('click', close);
    backdrop?.removeEventListener('click', close);
    cancelBtn?.removeEventListener('click', close);
    form?.removeEventListener('submit', onSubmit);
  };
}

export function closeTournamentModal(): void {
  _cleanup?.();
  _cleanup = null;
  document.getElementById('tournamentModalContainer')?.remove();
  document.body.style.overflow = '';
}