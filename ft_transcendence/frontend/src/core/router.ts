import { renderLandingPage } from '../pages/LandingPage';
import { renderRegisterPage } from '../pages/RegisterPage';
import { renderGameRoom } from '../components/game/GameRoom';
import { renderLoginPage } from '../pages/LoginPage';
import { renderDemoGameRoom } from '../components/landing/DemoGameRoom(A)';
import { renderHomePage } from '../pages/HomePage';

// Interfaz para las rutas
interface Route {
  path: string;
  handler: () => void;
  protected?: boolean;
}

// Definir rutas de la aplicación
const routes: Route[] = [
  { path: '/', handler: () => renderLandingPage() },
  { path: '/register', handler: () => renderRegisterPage() },
  { path: '/game', handler: () => renderGameRoom(), protected: true },
  { path: '/demo-game', handler: () => renderDemoGameRoom(), protected: true },
  { path: '/login', handler: () => renderLoginPage() },
  { path: '/home', handler: () => renderHomePage(), protected: true },

];

// Función para navegar a una ruta
export const navigateTo = (path: string): void => {
  window.history.pushState({}, '', path);
  handleRoute();
};

// Función para manejar rutas
const handleRoute = (): void => {
  const currentPath = window.location.pathname;
  console.log("Handling route for path:", currentPath);
  
  const route = routes.find(r => r.path === currentPath);
  
  if (!route) {
    console.log("Route not found, redirecting to landing page");
    // Ruta no encontrada, redirigir a landing page
    navigateTo('/');
    return;
  }

  // Verificar si la ruta requiere autenticación
  if (route.protected && !isAuthenticated()) {
    console.log("Route requires authentication but not authenticated, redirecting to login");
    navigateTo('/login');
    return;
  }

  console.log("Executing handler for route:", currentPath);
  // Ejecutar el handler de la ruta
  route.handler();
};

// Verificar si el usuario está autenticado
const isAuthenticated = (): boolean => {
  // Debug cookie information
  console.log("Document cookies:", document.cookie);
  
  // Check JWT cookie or localStorage
  const hasJwtCookie = document.cookie.includes("jwt=");
  const hasLocalStorageUser = localStorage.getItem("user") !== null;
  
  console.log("Has JWT cookie:", hasJwtCookie);
  console.log("Has localStorage user:", hasLocalStorageUser);
  
  // Create localStorage user data from cookie if needed
  if (hasJwtCookie && !hasLocalStorageUser) {
    try {
      // Store basic user data in localStorage for future authentication checks
      localStorage.setItem("user", JSON.stringify({ 
        authenticated: true,
        id: 1,  // Valor temporal para que funcione la autenticación
        username: "user",
        email: "user@example.com"
      }));
      console.log("Created localStorage user from JWT cookie");
    } catch (err) {
      console.error("Failed to create localStorage user:", err);
    }
  }
  
  const isAuth = hasJwtCookie || hasLocalStorageUser;
  console.log("Final authentication status:", isAuth);
  
  // Si estamos autenticados, permitimos el acceso
  return isAuth;
};

// Inicializar el router
export const initRouter = (): void => {
  // Manejar navegación inicial
  handleRoute();
  
  // Escuchar cambios en el historial (botones atrás/adelante)
  window.addEventListener('popstate', handleRoute);
  
  // Interceptar clicks en enlaces
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('/')) {
      e.preventDefault();
      navigateTo(target.getAttribute('href')!);
    }
  });
};