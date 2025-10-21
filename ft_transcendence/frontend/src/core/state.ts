// --- GLOBAL SSE SYNC ---
import { listenSSE } from './sse';

function handleGlobalSSE(msg: any) {
  // Si arriba un esdeveniment de reset, fem fetch complet
  if (msg.type === 'users_reset') {
    fetch('/api/users')
      .then(r => r.json())
      .then(users => setState({ users }));
    return;
  }
  if (msg.type === 'rooms_reset') {
    fetch('/api/rooms')
      .then(r => r.json())
      .then(rooms => setState({ rooms }));
    return;
  }
  if (msg.type === 'user_registered' || msg.type === 'user_updated') {
    if (msg.user) {
      setState({ users: [...(state.users || []), msg.user] });
      window.dispatchEvent(new CustomEvent('users:updated', { detail: msg.user }));
    }
  }
  if (msg.type === 'room_update' || msg.type === 'room_created') {
    if (msg.room) {
      setState({ rooms: [...(state.rooms || []), msg.room] });
      window.dispatchEvent(new CustomEvent('rooms:updated', { detail: msg.room }));
    }
  }
}

export function initGlobalSSE() {
  listenSSE('/api/sse/global', handleGlobalSSE);
}
// Estado global de la aplicación
export interface AppState {
  user: User | null;
  loading: boolean;
  currentView: 'landing' | 'login' | 'register' | '2fa' | 'dashboard' | 'game' | 'matches' | 'lobby' | 'terms' | 'privacy' | 'about';
  showGame: boolean;
  theme: 'dark' | 'light';
  players: PlayersState;
  match: MatchInfo | null;
  users?: User[]; // Llista global d'usuaris
  rooms?: any[]; // Llista global de sales (defineix tipus si vols)
  pendingUser?: User | null; // Usuari pendent de completar 2FA
  currentTournament?: {
    id: string;
    name: string;
    minPlayers: number;
    maxPlayers: number;
    bracketType: string;
    timeLimit: number;
    createdBy: string;
    createdAt: string;
    status: 'waiting' | 'started' | 'finished';
  } | null;
}


// Helpers per cookies segures
function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}; secure; samesite=lax`;
}
function getCookie(name: string): string | null {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, null as string | null);
}

// Estado inicial
let state: AppState = {
  user: null,
  loading: true,
  currentView: 'landing',
  showGame: false,
  theme: 'dark',
  match: null,
  players: { player1: null, player2: null },
  users: [],
  rooms: [],
  currentTournament: null
};
  
export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar_url?: string; // URL de l'avatar personalitzat
  userId?: number;
}

export type PlayerRole = 'player1' | 'player2';

export interface MatchInfo {
  roomCode: string;
  role: PlayerRole;
}

export interface PlayerPublic {
  id: number;
  username: string;
  email: string;
  ready?: boolean;
  avatar_url?: string;
  avatar?: string;
}

export interface PlayersState {
  player1: PlayerPublic | null;
  player2: PlayerPublic | null;
}
  
  
  // Subscribers para cambios de estado
  const subscribers: Array<(state: AppState) => void> = [];
  

  // Obtener estado actual
  export const getState = (): AppState => {
    // Si no hi ha usuari a memòria, intenta restaurar de cookies (només info bàsica, mai token)
    if (!state.user) {
      const userCookie = getCookie('spa_user');
      if (userCookie) {
        try {
          const parsed = JSON.parse(userCookie);
          // Validació bàsica
          if (parsed && parsed.id && parsed.username) {
            state.user = parsed;
          }
        } catch {}
      }
    }
    return { ...state };
  };
  
  // Actualizar estado
  export const setState = (newState: Partial<AppState>): void => {
    state = { ...state, ...newState };
    subscribers.forEach(callback => callback(state));
  };
  
  // Suscribirse a cambios de estado
  export const subscribe = (callback: (state: AppState) => void): void => {
    subscribers.push(callback);
  };
  

  // Inicializar estat des de localStorage/cookies
  export const initState = (): void => {
    // NO restaurar usuari de localStorage, però sí de cookies (només info bàsica)
    const userCookie = getCookie('spa_user');
    if (userCookie) {
      try {
        const parsed = JSON.parse(userCookie);
        if (parsed && parsed.id && parsed.username) {
          state.user = parsed;
        }
      } catch {}
    }

    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const savedMatch = sessionStorage.getItem('match');
    const savedTournament = localStorage.getItem('currentTournament');
    if (savedTheme) {
      state.theme = savedTheme;
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    if (savedMatch) {
      try {
        state.match = JSON.parse(savedMatch);
      } catch {
        sessionStorage.removeItem('match');
      }
    }
    if (savedTournament) {
      try {
        state.currentTournament = JSON.parse(savedTournament);
      } catch (error) {
        console.error('Error parsing saved tournament:', error);
        localStorage.removeItem('currentTournament');
      }
    }
  };

// Sincronizar jugadores con el usuario actual
function syncPlayersWithUser(user: User | null) {
  if (!user) return;
  const nextPlayers: PlayersState = { ...state.players };
  (['player1', 'player2'] as PlayerRole[]).forEach((role) => {
    const p = nextPlayers[role];
    if (p && p.id === (user.id || user.userId)) {
      nextPlayers[role] = {
        ...p,
        username: user.username,
        email: user.email ?? p.email,
        avatar_url: user.avatar_url ?? p.avatar_url,
      };
    }
  });
  if (nextPlayers.player1 !== state.players.player1 || nextPlayers.player2 !== state.players.player2) {
    setState({ players: nextPlayers });
    window.dispatchEvent(new CustomEvent('match:players-updated'));
  }
}
  
  // Funciones de utilidad para el estado

  // Guardar usuari a cookies (només info bàsica, mai token ni dades sensibles)
  export const setUser = (user: User | null): void => {
    setState({ user });
    if (user && user.id && user.username) {
      // Només info bàsica
      const safeUser = {
        id: user.id,
        username: user.username,
        avatar_url: user.avatar_url || '',
        email: user.email || ''
      };
      setCookie('spa_user', JSON.stringify(safeUser), 7);
    } else {
      setCookie('spa_user', '', -1); // Esborra cookie
    }
    if (user) syncPlayersWithUser(user);
  };
  
  export const setTheme = (theme: 'dark' | 'light'): void => {
    setState({ theme });
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    // Debug: verificar que se aplicó correctamente
    const appliedTheme = document.documentElement.getAttribute('data-theme');  };
  
  export const setLoading = (loading: boolean): void => {
    setState({ loading });
  };

  export const setMatch = (match: MatchInfo | null): void => {
  setState({ match });
  if (match) {
    sessionStorage.setItem('match', JSON.stringify(match));
  } else {
    sessionStorage.removeItem('match');
  }
};

export const clearMatch = (): void => {
  setMatch(null);
};

export const setPlayerReady = (role: PlayerRole, ready: boolean): void => {
  const current = state.players[role];
  const next: PlayersState = {
    ...state.players,
    [role]: current ? { ...current, ready } : current,
  };
  setState({ players: next });
};

export const setPlayerByRole = (role: PlayerRole, player: PlayerPublic | null): void => {
  const next: PlayersState = {
    ...state.players,
    [role]: player,
  };
  setState({ players: next });
};

export const clearPlayers = (): void => {
  setState({ players: { player1: null, player2: null } });
};


  // Verificar si el usuario está autenticado
  export const isAuthenticated = (): boolean => {
  const user = getState().user;
  
  if (!user) {
    return false;
  }
  
  // Usuario real - acceptar tant 'id' com 'userId'
  const userIdValue = user.id || user.userId;
  if (userIdValue && userIdValue > 0) {
    return true;
  }
  
  return false;
};

  //  NUEVO: Función para establecer el torneo actual
export const setCurrentTournament = (tournament: AppState['currentTournament']): void => {
  state = { ...state, currentTournament: tournament };
  if (tournament) {
    localStorage.setItem('currentTournament', JSON.stringify(tournament));
  } else {
    localStorage.removeItem('currentTournament');
  }
};

//  Funcions de gestió de vista actual
export const setCurrentView = (view: AppState['currentView']): void => {
  setState({ currentView: view });
  // Mantenim sincronitzada la URL amb la vista
  if (view === 'dashboard') {
    window.history.pushState({}, '', '/dashboard');
  } else if (view === 'game') {
    window.history.pushState({}, '', '/game');
  } else if (view !== '2fa') { // Evitem canviar la URL per a vistes especials com 2fa
    window.history.pushState({}, '', '/' + view);
  }
};

//  Funció per mostrar/amagar el joc
export const setShowGame = (showGame: boolean): void => {
  setState({ showGame });
};

//  Funció per establir usuari pendent (per 2FA)
export const setPendingUser = (pendingUser: User | null): void => {
  setState({ pendingUser });
};

//  Verificar estado de autenticación - migrat de GameEngine.ts
export const checkAuth = async (): Promise<void> => {
  
  //  NO MORE COOKIE DETECTION - More secure approach
  // 2FA detection now handled by:
  // 1. Login response: twoFactorRequired flag
  // 2. OAuth redirect: URL parameter twoFactorRequired=1
  
  try {
    // Importem la configuració API de forma dinàmica per evitar dependències circulars
    const { API_CONFIG } = await import('../config/api');
    
    const response = await fetch(API_CONFIG.AUTH.PROFILE, { 
      credentials: 'include' 
    });
    const data = await response.json();
    
    
    if (response.ok && data.success) {
      // 🔧 FIX: No forcem la vista dashboard aquí - deixem que el router decideixi
      setState({ user: data.user, loading: false });
      
      //  Revaluar la ruta després de detectar autenticació
      const { reevaluateCurrentRoute } = await import('./router');
      reevaluateCurrentRoute();
    } else {
      setState({ user: null, loading: false });
    }
  } catch (error) {
    setState({ user: null, loading: false });
  }
};

// Función para limpiar completamente el estado de la partida
export const clearGameSession = (): void => {
  
  // Reset match and players state
  setState({
    match: null,
    players: { player1: null, player2: null },
    currentTournament: null,
    showGame: false
  });
  
  // Clear any game-related localStorage
  localStorage.removeItem('currentMatch');
  localStorage.removeItem('gameRoom');
  localStorage.removeItem('currentTournament');
  
  // Clear WebSocket connections
  if ((window as any).gameWebSocket) {
    const ws = (window as any).gameWebSocket;
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
    delete (window as any).gameWebSocket;
  }
  
  // Reset any global game flags
  if ((window as any).__gameRoom) {
    delete (window as any).__gameRoom;
  }
  
};