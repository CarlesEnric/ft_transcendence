// Estado global de la aplicación
interface AppState {
    user: User | null;
    theme: 'dark' | 'light';
    loading: boolean;
  }
  
  interface User {
    userId: number;
    username: string;
    email: string;
    isDemoUser?: boolean;
    demoStartTime?: number;
    demoTimeLimit?: number; // Tiempo límite para la demo en milisegundos
  }
  
  // Estado inicial
  let state: AppState = {
    user: null,
    theme: 'dark',
    loading: false,
  };
  
  // Subscribers para cambios de estado
  const subscribers: Array<(state: AppState) => void> = [];
  
  // Obtener estado actual
  export const getState = (): AppState => ({ ...state });
  
  // Actualizar estado
  export const setState = (newState: Partial<AppState>): void => {
    state = { ...state, ...newState };
    subscribers.forEach(callback => callback(state));
  };
  
  // Suscribirse a cambios de estado
  export const subscribe = (callback: (state: AppState) => void): void => {
    subscribers.push(callback);
  };
  
  // Inicializar estado desde localStorage
  export const initState = (): void => {
    const savedUser = localStorage.getItem('user');
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    
    if (savedUser) {
      state.user = JSON.parse(savedUser);
    }
    
    if (savedTheme) {
      state.theme = savedTheme;
    }
  };
  
  // Funciones de utilidad para el estado
  export const setUser = (user: User | null): void => {
    setState({ user });
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  };
  
  export const setTheme = (theme: 'dark' | 'light'): void => {
    setState({ theme });
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  };
  
  export const setLoading = (loading: boolean): void => {
    setState({ loading });
  };

  // Verificar si el usuario está autenticado (incluyendo demos)
  export const isAuthenticated = (): boolean => {
  const user = getState().user;
  if (!user) return false;
  
  // Usuario real
  if (user.userId > 0) return true;
  
  // Usuario demo con tiempo válido
  if (user.isDemoUser && user.demoStartTime && user.demoTimeLimit) {
    const timeLeft = user.demoTimeLimit - (Date.now() - user.demoStartTime);
    return timeLeft > 0;
  }
  
  return false;
};