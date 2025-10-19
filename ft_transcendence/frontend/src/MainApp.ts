/**
 * Main entry point - SPA Vanilla TypeScript
 *  MIGRAT: Arquitectura modular amb core centralitzat
 */

// Importem els estils globals
import '../public/styles/index.css';

// Importem els mòduls core migrats
import { initState, initGlobalSSE } from './core/state.js';
import { initRouter } from './core/router.js';
import './core/i18n.js'; // Configuració d'internacionalització

// Importem configuració de l'API
import { API_CONFIG } from './config/api.js';

// Importem la classe App principal (simplificada després de migració)
import { App } from './GameEngine.js';

/**
 * Inicialitzar aplicació
 */
async function initializeApp(): Promise<void> {
    // Inicialització global del gameMode
    window.app = window.app || {};
    window.app._gameMode = 'online'; // valor per defecte
    window.app.setGameMode = function(mode: 'ai' | 'inline' | 'online' | 'tournament') {
      window.app._gameMode = mode;
    };
    window.app.getGameMode = function() {
      return window.app._gameMode;
    };
  try {
    
  // 0.  PRIMER: Inicialitzar estat (inclou tema) abans que res
  initState();
  initGlobalSSE();
    
    // 1.  SEGON: Check OAuth redirect
    const { handleOAuthRedirect } = await import('./core/auth-frontend.js');
    if (await handleOAuthRedirect()) {
      return; // OAuth redirect handled, no need to continue init
    }
    
    // 1.5.  VERIFICAR AUTENTICACIÓ REAL: Comprovar sessió al servidor
    const { checkAuth } = await import('./core/state.js');
    await checkAuth();
    
    // 2. Inicialitzar router amb navegació centralitzada
    initRouter();
    
    // 3. Inicialitzar aplicació principal
    const app = new App();
    await app.init();
    
    
  } catch (error) {
    console.error(' Failed to initialize application:', error);
  }
}

// Inicialitzar quan el DOM estigui carregat
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});