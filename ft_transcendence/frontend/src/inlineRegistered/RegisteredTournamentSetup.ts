import { fetchRegisteredUsers } from './RegisteredTournamentService';
import { initRegisteredTournament, RegisteredPlayer, normalizeAvatar } from './RegisteredTournamentStore';
import { navigateTo } from '../core/router';

let usersCache: Array<{ id: number; username: string; avatar_url?: string | null }> = [];

export function renderRegisteredTournamentSetup(): string {
  return `
  <div class="min-h-screen global-bg flex items-center justify-center p-6 relative">
    <div class="absolute inset-0 z-0 backdrop-blur-md bg-gray-900/70"></div>
    <div class="relative w-full max-w-3xl bg-gray-900 rounded-[20px] shadow-[2px_2px_10px_0px_rgba(0,240,255,0.20)] outline outline-2 outline-offset-[-2px] outline-cyan-500 border border-cyan-700 p-6 z-10">
      <h2 class="text-xl text-white font-bold mb-4">🏆 Tournament Inline (registered)</h2>
      <div class="grid gap-4">
        <div>
          <label class="text-sm text-gray-300">Size</label>
          <select id="tiSize" class="w-full bg-gray-800 text-white rounded p-2 border border-gray-700">
            <option value="4" selected>4 players (semifinals + final)</option>
            <option value="8">8 players (quarters + semis + final)</option>
          </select>
        </div>
        <div>
          <label class="text-sm text-gray-300">Participants (choose in seed order)</label>
          <div id="tiParticipants" class="grid sm:grid-cols-2 gap-2"></div>
        </div>
        <div class="flex justify-end gap-2">
          <button id="tiCancel" class="px-4 py-2 bg-gray-700 text-white rounded">Cancel</button>
          <button id="tiStart" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded">Create</button>
        </div>
      </div>
    </div>
  </div>`;
}

export async function initRegisteredTournamentSetup(): Promise<void> {
  usersCache = await fetchRegisteredUsers();

  const sizeSel = document.getElementById('tiSize') as HTMLSelectElement;
  const listEl = document.getElementById('tiParticipants')!;
  const renderPickers = (size: 4 | 8) => {
    listEl.innerHTML = '';
    for (let i = 1; i <= size; i++) {
      const id = `seat_${i}`;
      listEl.insertAdjacentHTML('beforeend', `
        <div class="flex items-center gap-2">
          <span class="text-gray-400 text-sm w-14">Seat ${i}</span>
          <select id="${id}" class="flex-1 bg-gray-800 text-white rounded p-2 border border-gray-700">
            ${usersCache.map(u => `<option value="${u.id}">${u.username}</option>`).join('')}
          </select>
        </div>
      `);
    }
  };
  renderPickers(4);

  sizeSel.addEventListener('change', () => renderPickers(parseInt(sizeSel.value, 10) as 4 | 8));

  document.getElementById('tiCancel')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo('/dashboard');
  });

  document.getElementById('tiStart')?.addEventListener('click', (e) => {
    e.preventDefault();
    const size = parseInt(sizeSel.value, 10) as 4 | 8;
    const selected = new Set<number>();
    const participants: Array<{ userId:number; username:string; avatar?:string }> = [];
    for (let i = 1; i <= size; i++) {
      const sel = document.getElementById(`seat_${i}`) as HTMLSelectElement | null;
      if (!sel) { alert('Fallo al leer los asientos'); return; }
      const uid = parseInt(sel.value, 10);
      if (selected.has(uid)) {
        alert('No repitas jugadores en el seeding.');
        return;
      }
      selected.add(uid);
      const user = usersCache.find(u => u.id === uid)!;
      participants.push({
        userId: user.id,
        username: user.username,
        avatar: normalizeAvatar(user.avatar_url || undefined)
      });
    }
    initRegisteredTournament(size, participants);
    navigateTo('/tournament/inline-registered/lobby');
  });
}