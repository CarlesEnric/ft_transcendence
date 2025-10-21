import { renderLandingPage } from '../pages/LandingPage';
import { renderRegisterPage } from '../pages/RegisterPage';
import { renderGameRoom } from '../components/game/GameRoom';
import { renderLoginPage } from '../pages/LoginPage';
import { renderDemoGameInline } from '../components/game/DemoGameInline';
import { renderHomePage } from '../pages/HomePage';
import { isAuthenticated, getState, setCurrentView, AppState } from './state';
import { render2FAView, renderViewToContainer } from './views';
import { renderTournamentLobby } from '../components/tournament/TournamentLobby';
import { renderTournamentBracketPage } from '../pages/TournamentBracketPage';
import { destroyRoomView } from './roomView';

// Footer pages
import { renderTermsPage } from '../pages/TermsPage';
import { renderPrivacyPage } from '../pages/PrivacyPage';
import { renderAboutPage } from '../pages/AboutPage';

// === LOCAL OFFLINE TOURNAMENT (NUEVO) ===
import { showLocalTournamentModal, closeLocalTournamentModal } from '../localTournament/LocalTournamentModal';
import { renderLocalTournamentSetup } from '../localTournament/LocalTournamentSetup';
import { renderLocalTournamentLobby } from '../localTournament/LocalTournamentLobby';
import { renderLocalBracketPage } from '../localTournament/LocalBracketPage';
import { renderLocalMatchGame } from '../localTournament/LocalMatchGame';

const handle2FAView = (): void => {
  setCurrentView('2fa');
  renderViewToContainer(render2FAView());
};

const handleDashboardView = async (): Promise<void> => {

  // Cleanup any existing room SSE connections when going to dashboard
  destroyRoomView();

  const authenticated = isAuthenticated();

  if (!authenticated) {
    console.warn('[Dashboard] User not authenticated, cannot access dashboard');
    navigateTo('/login');
    return;
  }

  const currentState = getState();

  setCurrentView('dashboard');

  await renderHomePage();
  await import('../pages/HomePage').then(mod => mod.initHomePage());

};

interface Route {
  path: string;
  handler: () => void | Promise<void>;
  protected?: boolean;
  view?: AppState['currentView'];
}

// Rutas estáticas
const routes: Route[] = [
  { path: '/', handler: () => renderLandingPage(), view: 'landing', protected: false },
  { path: '/register', handler: () => renderRegisterPage(), view: 'register', protected: false },
  { path: '/game', handler: () => { renderGameRoom(); }, protected: true },
  { path: '/pong2dinline', handler: () => import('../components/game/Pong2dInline').then(mod => mod.renderPong2dInline()), protected: true },
  { path: '/pong2dia', handler: () => import('../components/game/Pong2dIA').then(mod => mod.renderPong2dIA()), protected: true },
//  { path: '/pong2donline', handler: () => import('../components/game/GameRoom').then(mod => mod.renderGameRoom('online')), protected: true },
  { path: '/demo-inline', handler: () => renderDemoGameInline(), protected: false },
  { path: '/login', handler: () => renderLoginPage(), view: 'login', protected: false },
  { path: '/dashboard', handler: () => handleDashboardView(), view: 'dashboard', protected: true },
  { path: '/2fa', handler: () => handle2FAView(), view: '2fa', protected: true },
  {
    path: '/local-tournament/start', handler: () => {
      const app = document.getElementById('app');
      if (app)
        app.innerHTML = `<div class="min-h-screen global-bg"></div>`;
      showLocalTournamentModal();
    }, protected: false
  },
  { path: '/local-tournament/setup', handler: () => renderLocalTournamentSetup(), protected: false },
  { path: '/local-tournament/lobby', handler: () => renderLocalTournamentLobby(), protected: false },
  { path: '/local-tournament/bracket', handler: () => renderLocalBracketPage(), protected: false },
  {
    path: '/local-tournament/match', handler: () => {
      const params = new URLSearchParams(window.location.search);
      const matchId = Number(params.get('matchId') || '0');
      if (!matchId) { navigateTo('/local-tournament/bracket'); return; }
      renderLocalMatchGame(matchId);
    }, protected: false
  },
  //Tournament inline con usuarios registrados
  {
    path: '/tournament/inline-registered/setup',
    handler: async () => {
      const { renderRegisteredTournamentSetup, initRegisteredTournamentSetup } =
        await import('../inlineRegistered/RegisteredTournamentSetup');
      document.getElementById('app')!.innerHTML = renderRegisteredTournamentSetup();
      await initRegisteredTournamentSetup();
    },
    protected: true
  },
  {
    path: '/tournament/inline-registered/lobby',
    handler: async () => {
      const { renderRegisteredTournamentLobby, initRegisteredTournamentLobby } =
        await import('../inlineRegistered/RegisteredTournamentLobby'); // path
      document.getElementById('app')!.innerHTML = renderRegisteredTournamentLobby();
      await initRegisteredTournamentLobby();
    },
    protected: true
  },
  {
    path: '/tournament/inline-registered/bracket',
    handler: async () => {
      const { renderRegisteredBracketPage, initRegisteredBracketPage } =
        await import('../inlineRegistered/RegisteredBracketPage'); // path
      document.getElementById('app')!.innerHTML = renderRegisteredBracketPage();
      await initRegisteredBracketPage();
    },
    protected: true
  },
  {
    path: '/tournament/inline-registered/game',
    handler: async () => {
      const { renderRegisteredMatchGame, initRegisteredMatchGame } =
        await import('../inlineRegistered/RegisteredMatchGame'); // path
      document.getElementById('app')!.innerHTML = renderRegisteredMatchGame();
      await initRegisteredMatchGame();
    },
    protected: true
  },
  // Footer routes - properly render to DOM
  {
    path: '/terms', handler: () => {
      const app = document.getElementById('app');
      if (app) {
        app.innerHTML = renderTermsPage();
        import('../pages/TermsPage').then(mod => mod.initTermsPage());
      }
    }, view: 'terms', protected: false
  },
  {
    path: '/privacy', handler: () => {
      const app = document.getElementById('app');
      if (app) {
        app.innerHTML = renderPrivacyPage();
        import('../pages/PrivacyPage').then(mod => mod.initPrivacyPage());
      }
    }, view: 'privacy', protected: false
  },
  {
    path: '/about', handler: () => {
      const app = document.getElementById('app');
      if (app) {
        app.innerHTML = renderAboutPage();
        import('../pages/AboutPage').then(mod => mod.initAboutPage());
      }
    }, view: 'about', protected: false
  },
];

export const navigateTo = (path: string): void => {
  window.history.pushState({}, '', path);
  handleRoute();
};

export const navigateToView = (view: AppState['currentView']): void => {
  const route = routes.find(r => r.view === view);
  if (route) {
    setCurrentView(view);
    if (route.path !== window.location.pathname) {
      window.history.pushState({}, '', route.path);
    }
    route.handler();
  } else {
    console.warn(`No route found for view: ${view}`);
  }
};

const handleRoute = (): void => {
  const currentPath = window.location.pathname;
  // Siempre cerrar modal local tournament si la ruta cambia
  closeLocalTournamentModal();
  const currentSearch = window.location.search;

  const currentState = getState();
  if (currentState.loading) {
    setTimeout(() => handleRoute(), 100);
    return;
  }
  const isOnlineTournamentPage = /^\/tournaments(\/|$)/.test(currentPath);
  const isLocalTournamentPage = /^\/local-tournament(\/|$)/.test(currentPath);
  
  if (!isOnlineTournamentPage) {
    import('../components/tournament/TournamentLobby').then(mod => {
      if (mod.cleanupTournamentLobby) mod.cleanupTournamentLobby();
    }).catch(() => { });
    import('../pages/TournamentBracketPage').then(mod => {
      if (mod.cleanupTournamentBracketPage) mod.cleanupTournamentBracketPage();
    }).catch(() => { });
  }
  
  if (!isLocalTournamentPage) {
    import('../localTournament/LocalTournamentLobby').then(mod => {
      if (mod.cleanupLocalTournamentLobby) mod.cleanupLocalTournamentLobby();
    }).catch(() => { });
  }
  if (currentPath === '/' && isAuthenticated()) {
    navigateTo('/dashboard');
    return;
  }

  const tourMatch = currentPath.match(/^\/tournaments\/(\d+)$/);
  if (tourMatch) {
    const idNum = Number(tourMatch[1]);
    if (!Number.isFinite(idNum) || idNum <= 0) {
      navigateTo('/dashboard');
      return;
    }
    if (!isAuthenticated()) {
      navigateTo('/login');
      return;
    }
    renderTournamentLobby(idNum);
    return;
  }

  const bracketMatch = currentPath.match(/^\/tournaments\/(\d+)\/bracket$/);
  if (bracketMatch) {
    const idNum = Number(bracketMatch[1]);
    if (!Number.isFinite(idNum) || idNum <= 0) {
      navigateTo('/dashboard');
      return;
    }
    if (!isAuthenticated()) {
      navigateTo('/login');
      return;
    }
    renderTournamentBracketPage(idNum);
    return;
  }

  const route = routes.find(r => r.path === currentPath);

  if (!route) {
    if (isAuthenticated()) {
      navigateTo('/dashboard');
    } else {
      navigateTo('/');
    }
    return;
  }

  if (route.protected && !isAuthenticated()) {
    navigateTo('/landing');
    return;
  }

  if (route.view) setCurrentView(route.view);

  route.handler();
};

export const initRouter = (): void => {
  handleRoute();
  window.addEventListener('popstate', handleRoute);

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    const pathAnchor = target.closest?.('a[href^="/"]') as HTMLAnchorElement | null;
    if (pathAnchor && pathAnchor.getAttribute('href')) {
      e.preventDefault();
      navigateTo(pathAnchor.getAttribute('href')!);
      return;
    }

    const view = target.getAttribute('data-view') as AppState['currentView'];
    if (view) {
      e.preventDefault();
      navigateToView(view);
    }
  });
};

export const reevaluateCurrentRoute = (): void => {
  handleRoute();
};