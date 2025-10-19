import { navigateTo } from '../../core/router';
import { getState, setUser, User, setCurrentView } from '../../core/state';
import i18n from '../../core/i18n';
import { handleLogout } from '../../core/auth-frontend';
import { showTournamentBrowser } from '../tournament/TournamentBrowser';
import { subscribe } from '../../core/state';
import { API_CONFIG } from '../../config/api';
import { HowToPlay } from '../game/howToPlay';

// SPA: Reset function to clean up listeners and state
export function resetHeaderCard() {
  // No-op, kept for compatibility
  // Remove sidebar overlay if present
  const overlay = document.getElementById('sidebar-overlay');
  if (overlay) overlay.remove();
  // Remove event listeners if any were added globally (none tracked here, but placeholder)
  // If you add global listeners, track and remove them here
}

// Referències globals (definides per GameEngine)
declare global {
  interface Window {
    app: any;
    _lastAvatarChange?: number;
  }
}


export const renderHeaderCard = (): string => {
  const { user } = getState();
  // Cache-busting: només canvia quan canvia l'avatar realment
  let cacheBuster = '';
  if (user?.avatar_url) {
    // window._lastAvatarChange només s'actualitza a la subscripció, no aquí
    cacheBuster = String(window._lastAvatarChange || '');
  }
  let avatarUrl = '/images/avatar1.png';
  if (user?.avatar_url) {
    if (/^https?:\/\//.test(user.avatar_url)) {
      // URL absoluta (Google, etc)
      avatarUrl = `${user.avatar_url}${cacheBuster ? `?cb=${cacheBuster}` : ''}`;
    } else {
      // URL relativa (backend propi)
      avatarUrl = `https://${API_CONFIG.DOMAIN}${user.avatar_url}?cb=${cacheBuster}`;
    }
  }

  return `
  <section id="header-card"
    class="self-stretch p-6 bg-gray-900 rounded-[20px]
           shadow-[2px_2px_10px_0px_rgba(0,240,255,0.20)]
           outline outline-2 outline-offset-[-2px] outline-cyan-500
           flex flex-col lg:flex-row justify-start items-end gap-8">

    <!-- Col: Avatar + Info -->
    <div class="flex items-center gap-6">
      <!-- Avatar del usuario con data attribute -->
      <img data-user-avatar 
           class="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full
                  shadow-[0px_2px_8px_0px_rgba(0,240,255,0.20)]
                  cursor-pointer hover:scale-105 transition-transform duration-200
                  hover:shadow-[0px_4px_16px_0px_rgba(0,240,255,0.40)]"
           src="${avatarUrl}" 
           alt="User Profile"
           title="${i18n.t('header.editProfile') || 'Editar perfil'}"/>

      <div class="p-2 flex flex-wrap justify-start items-start gap-4 lg:flex-row lg:items-center">
        <div class="px-3 py-2 bg-teal-600 rounded-lg outline outline-1 outline-teal-600 inline-flex justify-center items-center gap-2">
          <div class="text-center text-white text-base font-semibold leading-none">
            ${user?.username || 'User name'}
          </div>
        </div>
        ${new HowToPlay().render()}
      </div>


    <!-- Col: Actions -->
    <div class="w-full lg:flex-1 flex flex-col justify-between items-end gap-6">
      <div class="w-full inline-flex justify-end items-start gap-4">
        <button id="settingsBtn"
          class="w-14 h-14 sm:w-16 sm:h-16 bg-cyan-100 rounded-full grid place-items-center
                 hover:bg-cyan-200 transition-colors duration-200 hover:scale-105 transform"> 
          <img src="/icons/settings.png" alt="Settings" class="w-10 h-10"/>
        </button>
        
        <button id="logoutIconBtn"
          class="w-14 h-14 sm:w-16 sm:h-16 bg-cyan-100 rounded-full grid place-items-center
                 hover:bg-cyan-200 transition-colors duration-200 hover:scale-105 transform">
          <img src="/icons/logout.png" alt="Logout" class="w-10 h-10"/>
        </button>
      </div>

      <div class="flex flex-col items-start gap-3">
        <div class="text-2xl">
          <span class="text-blue-300 font-bold tracking-widest">${i18n.t('header.selectMode')}</span>
          <span class="text-cyan-200 font-black tracking-widest">${i18n.t('header.play')} </span>
        </div>

        <div class="w-full sm:w-[26rem] inline-flex justify-center items-start gap-3">
          <div class="w-40 relative inline-flex flex-col gap-1">
            <select id="modeSelect"
              class="h-11 px-3 py-2 bg-gray-800 text-white rounded-md outline outline-1 outline-gray-600
                     focus:outline-cyan-400 focus:bg-gray-700 transition-colors duration-200">
              <option value="ai">1 vs AI</option>
              <option value="inline">1 vs 1 (inline)</option>
              <option value="online">1 vs 1 (online)</option>
              <option value="tournament-inline-registered">tournament (inline)</option>
              <option value="tournament">tournament (online)</option>
            </select>
          </div>

          <button id="playNowBtn"
            class="flex-1 px-6 py-3 bg-cyan-200 rounded-lg font-bold text-gray-700
                   hover:bg-cyan-400 transition-colors duration-200 hover:scale-105 transform">
            ${i18n.t('header.playNow')}
          </button>
        </div>
      </div>
    </div>
  </section>`;
};




// cachedUser ha de ser persistent entre renders SPA
export let cachedUser: { id?: number, avatar_url?: string } = {};
let isRenderingHeaderCard = false;


let headerCardSubscribed = false;
if (typeof window !== 'undefined' && !headerCardSubscribed) {
  // Helper per normalitzar l'avatar_url (sense query params)
  function normalizeAvatarUrl(url?: string): string {
    if (!url) return '';
    return url.split('?')[0];
  }
  subscribe((state: any) => {
    const user = state?.user;
    if (state.currentView !== 'dashboard') return;
    if (!user) return;
    // Només re-render si canvia id o avatar base (sense query)
    const newAvatarBase = normalizeAvatarUrl(user.avatar_url);
    const cachedAvatarBase = normalizeAvatarUrl(cachedUser.avatar_url);
    if (newAvatarBase !== cachedAvatarBase) {
      window._lastAvatarChange = Date.now();
    }
    if (user.id !== cachedUser.id || newAvatarBase !== cachedAvatarBase) {
      if (isRenderingHeaderCard) return;
      isRenderingHeaderCard = true;
      cachedUser = { id: user.id, avatar_url: user.avatar_url };
      const header = document.getElementById('header-card');
      if (header && header.parentElement) {
        const temp = document.createElement('div');
        temp.innerHTML = renderHeaderCard();
        const newHeader = temp.firstElementChild as HTMLElement;
        if (newHeader) {
          header.parentElement.replaceChild(newHeader, header);
          setTimeout(() => {
            initHeaderCard();
            isRenderingHeaderCard = false;
          }, 0);
        } else {
          isRenderingHeaderCard = false;
        }
      } else {
        isRenderingHeaderCard = false;
      }
    }
  });
  headerCardSubscribed = true;
}


// Helper to remove all event listeners by replacing elements (idempotent re-attach)
function replaceElementWithClone(id: string) {
  const oldEl = document.getElementById(id);
  if (!oldEl) return null;
  const newEl = oldEl.cloneNode(true) as HTMLElement;
  oldEl.parentNode?.replaceChild(newEl, oldEl);
  return newEl;
}

export const initHeaderCard = async (): Promise<void> => {
  // NO reinicialitzis cachedUser aquí! Només listeners.
  // Settings sidebar
  const settingsBtn = replaceElementWithClone('settingsBtn');
  settingsBtn?.addEventListener('click', () => {
    let overlay = document.getElementById('sidebar-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'sidebar-overlay';
      overlay.className = 'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm opacity-0 transition-opacity duration-300';
      document.body.appendChild(overlay);
    }
    overlay.style.display = 'block';
    setTimeout(() => {
      overlay!.classList.remove('opacity-0');
      overlay!.classList.add('opacity-100');
    }, 10);
    const sidebar = document.getElementById('dashboard-sidebar');
    sidebar?.classList.remove('-translate-x-full');
    sidebar?.classList.add('translate-x-0');
    const closeSidebar = () => {
      sidebar?.classList.remove('translate-x-0');
      sidebar?.classList.add('-translate-x-full');
      overlay!.classList.remove('opacity-100');
      overlay!.classList.add('opacity-0');
      setTimeout(() => {
        overlay!.style.display = 'none';
      }, 300);
    };
    overlay.onclick = closeSidebar;
    const closeBtn = replaceElementWithClone('close-sidebar');
    if (closeBtn) closeBtn.onclick = closeSidebar;
    const escListener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeSidebar();
        document.removeEventListener('keydown', escListener);
      }
    };
    document.addEventListener('keydown', escListener);
  });

  // Logout
  const logoutBtn = replaceElementWithClone('logoutIconBtn');
  logoutBtn?.addEventListener('click', async () => {
    window._lastAvatarChange = undefined; // Neteja el cache-buster en logout
    await handleLogout();
  });

  // Play mode select + button (robust, SPA-proof)
  let selectedMode = 'ai';
  const modeSelect = replaceElementWithClone('modeSelect') as HTMLSelectElement | null;
  if (modeSelect) {
    selectedMode = modeSelect.value || 'ai'; // Valor per defecte
    modeSelect.addEventListener('change', (e) => {
      selectedMode = (e.target as HTMLSelectElement).value;
    });
  }
  const playNowBtn = replaceElementWithClone('playNowBtn');
  playNowBtn?.addEventListener('click', async () => {
    if (selectedMode === 'ai') {
      window.app?.setGameMode('ai');
      await Promise.resolve(navigateTo('/pong2dia'));
    } else if (selectedMode === 'inline') {
      window.app?.setGameMode('inline');
      await Promise.resolve(navigateTo('/pong2dinline'));
    } else if (selectedMode === 'online') {
      window.app?.setGameMode('online');
      await Promise.resolve(navigateTo('/pong2donline'));
    } else if (selectedMode === 'tournament') {
      window.app?.setGameMode('online'); // Mode per defecte per torneig
      showTournamentBrowser();
    } else if (selectedMode === 'tournament-inline-registered') {
        navigateTo('/tournament/inline-registered/setup');
  }
  });


  const howtoBtn = document.getElementById('howto-toggle');
  const howtoPanel = document.getElementById('howto-panel');
  if (howtoBtn && howtoPanel) {
    howtoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = howtoPanel.classList.contains('opacity-100');
      if (isVisible) {
        // Ocultar
        howtoPanel.classList.remove('opacity-100', 'scale-100');
        howtoPanel.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
      } else {
        // Mostrar
        howtoPanel.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
        howtoPanel.classList.add('opacity-100', 'scale-100');
      }
    });

    // Cierra el panel si se hace clic fuera
    document.addEventListener('click', (e) => {
      if (!howtoBtn.contains(e.target as Node) && !howtoPanel.contains(e.target as Node)) {
        howtoPanel.classList.remove('opacity-100', 'scale-100');
        howtoPanel.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
      }
    });
  }
};