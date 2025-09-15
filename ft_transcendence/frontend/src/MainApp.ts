/**
 * Main entry point - SPA Vanilla TypeScript
 */
// Primer importem la configuració de l'aplicació
import './config/init';

import '../public/styles/index.css';
import { initRouter } from './core/router';
import { initState } from './core/state';
import './core/i18n'; // Importar configuració de i18n
import { API_CONFIG } from './config/api';

import { App } from './GameEngine';

console.log('🚀 MainApp.ts loading...');
console.log('🌐 API Config:', {
  hostIp: API_CONFIG.HOST_IP,
  googleAuthUrl: API_CONFIG.AUTH.GOOGLE,
  wsUrl: API_CONFIG.GAME.WS
});

const rootElement = document.getElementById('root');
console.log('📍 Root element:', rootElement);

if (rootElement) {
  console.log('⚡ Initializing SPA...');
  const app = new App();
  app.mount(rootElement);
  
  // Exponer la app globalmente para acceso desde otros componentes
  (window as any).app = app;
  
  console.log('✅ App initialized successfully');
} else {
  console.error('❌ Root element not found!');
}

/*

FRONTEND ARCHLY

// Inicialitzar estado global
initState();

// Inicialitzar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌍 i18n initialized');
    console.log('🚀 FT Transcendence initialized');
    // Inicialitzar el router
    initRouter();
  });

*/
