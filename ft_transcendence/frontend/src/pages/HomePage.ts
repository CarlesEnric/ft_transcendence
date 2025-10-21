import { renderFooter, initFooter } from '../components/global/Footer';
import { renderHeaderCard, initHeaderCard, resetHeaderCard } from '../components/dashboard/HeaderCard';
import { renderRankingCard, initRankingCard, resetRankingCard } from '../components/dashboard/RankingCard';
import { initMatchHistoryCard, resetMatchHistoryCard } from '../components/dashboard/MatchHistory';
import { renderSidebar, initSidebar, resetSidebar } from '../components/dashboard/SideBar';
import { renderDebugPanel } from '../components/global/DebugPanel';
import { subscribe, getState } from '../core/state';
import { showEditProfileModal, initEditProfileModal, resetEditProfileModal } from '../components/dashboard/EditProfileModal';

let homePageInitialized = false;
let lastRenderedUserId: number | undefined = undefined;
let lastRenderedAvatar: string | undefined = undefined;
let dashboardError: boolean = false;
let homePageSubscription: ((state: any) => void) | null = null;

export async function initHomePage() {
  if (!homePageInitialized) {
    if (homePageSubscription) return;
    homePageSubscription = (state: any) => {
      if (state.currentView !== 'dashboard' || dashboardError) return;
      const user = state.user;
      if (!user) return;
      if (user.id !== lastRenderedUserId || user.avatar_url !== lastRenderedAvatar) {
        lastRenderedUserId = user.id;
        lastRenderedAvatar = user.avatar_url;
        renderHomePage();
      }
    };
    subscribe(homePageSubscription);
    window.addEventListener('languageChanged', async () => {
      const user = getState().user;
      if (user) {
        const { setCurrentView } = await import('../core/state');
        setCurrentView('dashboard');
        await renderHomePage();
      }
    });
    homePageInitialized = true;
  }
  initProfileAndFriendsEventListeners();
  initHomePageListeners();
}

export async function resetHomePage() {
  await Promise.all([
    resetHeaderCard?.(),
    resetRankingCard?.(),
    resetMatchHistoryCard?.(),
    resetSidebar?.(),
    resetEditProfileModal?.(),
  ]);
  homePageInitialized = false;
}

export const renderHomePage = async (): Promise<void> => {
  dashboardError = false;
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="min-h-screen global-bg flex items-center justify-center bg-gradient-to-br from-blue-500/25 to-white/5">
      <div class="w-full min-w-[320px] max-w-[1200px] px-6 py-8 flex flex-col gap-10 items-center justify-center">
        <!-- Header Card -->
        ${renderHeaderCard()}
        <!-- Segunda fila: Ranking (izq) + Match History (der) -->
        <div class="w-full flex flex-col lg:flex-row items-stretch gap-10">
          ${renderRankingCard()}
          <div id="match-history" class="flex-1 min-w-0"></div>
        </div>
        <div class="w-full flex justify-center">
          ${renderFooter()}
        </div>
        <!-- Sidebar -->
        ${renderSidebar()}
      </div>
    </div>
  `;
  try {
    await Promise.all([
      initHeaderCard?.(),
      initRankingCard?.(),
      initMatchHistoryCard?.(),
      initSidebar?.(),
      initEditProfileModal?.(),
      initFooter?.(),
    ]);
  } catch (err) {
    dashboardError = true;
    app.innerHTML = `<div class='text-red-500 text-xl p-8'>Error carregant el dashboard. Si us plau, torna-ho a intentar més tard.</div>`;
    console.error('Error carregant dashboard:', err);
    return;
  }
  initProfileAndFriendsEventListeners();
  initHomePageListeners();
};

const initProfileAndFriendsEventListeners = (): void => {
  const userAvatar = document.querySelector('[data-user-avatar]');
  if (userAvatar) {
    userAvatar.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showEditProfileModal();
    });
  } else {
    console.warn('User avatar not found');
  }
};

export function initHomePageListeners(): any {
  const playNowBtn = document.getElementById('playNowBtn');
}