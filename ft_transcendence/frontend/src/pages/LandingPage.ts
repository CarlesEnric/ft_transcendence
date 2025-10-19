import { navigateTo } from '../core/router';
import { setUser, User } from '../core/state';
import { renderLanguageSelector, initLanguageSelector } from '../components/global/LanguageSelector';
import i18n from '../core/i18n';
import { renderFooter, initFooter } from '../components/global/Footer';
import { PongPreview } from '../components/landing/PongPreview';
import { setupSpaCleanupListeners } from '../utils/spaCleanupListeners';

export const renderLandingPage = (): void => {
  const app = document.getElementById('app');
  if (!app) {
    console.error('App element not found');
    return;
  }

  app.innerHTML = `
    <!-- Background único usando la clase del CSS -->
    <div class="min-h-screen global-bg p-1/2 relative">
      
      <!-- Language Selector -->
      <div class="absolute top-4 right-4 z-10">
        ${renderLanguageSelector()}
      </div>

      <!-- Contenido principal centrado -->
      <div class="min-h-screen flex items-center justify-center overflow-hidden">
        <div class="w-full min-w-[320px]  max-w-[800px] px-6 py-4 flex flex-col justify-between items-center">
          
          <!-- Contenido principal -->
          <div class="w-full flex-1 py-7 flex flex-col justify-center items-center gap-10">
            
            <!-- Header text -->
            <div class="w-full max-w-96 flex flex-col justify-start items-center text-center">
              <div class="text-cyan-200 text-lg font-medium font-['Inter'] mb-2">
                ${i18n.t('landing.title') || 'Welcome to the most EPIC'}
              </div>
              <div class="text-cyan-200 text-3xl sm:text-4xl lg:text-5xl font-bold font-['Inter'] leading-tight">
                Transcender Pong
              </div>
            </div>
            
            <!-- Game preview container - AHORA INDEPENDIENTE Y MÁS ANCHO -->
            <div class="w-full max-w-[400px] lg:max-w-[500px] xl:max-w-[600px]">
              <div id="pong-preview-container" class="w-full">
                <!-- El componente PongPreview se inicializará aquí -->
              </div>
            </div>
            
            <!-- Buttons section - MANTIENE SU TAMAÑO ORIGINAL -->
            <div class="w-full max-w-96 flex flex-col justify-start items-center gap-3">
              
              <!-- Play as Guest button -->
              <div class="w-full flex gap-3">
                <button id="playDemoInline" class="flex-1 h-14 px-6 py-3 bg-cyan-700 hover:bg-cyan-800 rounded-lg flex justify-center items-center transition-colors">
                  <div class="text-center text-white text-base sm:text-lg font-bold font-['Inter'] leading-tight">
                    ${i18n.t('demo.playButtonInline') || 'PLAY AS GUEST'}
                  </div>
                </button>
                <button id="playDemoTournament" class="flex-1 h-14 px-6 py-3 bg-cyan-700 hover:bg-cyan-800 rounded-lg flex justify-center items-center transition-colors">
                  <div class="text-center text-white text-base sm:text-lg font-bold font-['Inter'] leading-tight">
                    ${i18n.t('demo.playButtonTournament') || 'PLAY AS GUEST'}
                  </div>
                </button>
              </div>
              
              <!-- Login/Register button -->
              <button id="loginRegisterBtn" class="w-full h-14 px-6 py-3 bg-cyan-200 hover:bg-cyan-300 rounded-lg flex justify-center items-center transition-colors">
                <div class="text-center text-teal-800 text-base sm:text-lg font-bold font-['Inter'] leading-tight">
                  ${i18n.t('auth.login') || 'LOGIN or REGISTER'}
                </div>
              </button>
            </div>
          </div>
          
          <!-- Footer -->
           <div class="w-full flex justify-center">
            ${renderFooter()}
          </div>
        </div>
      </div>
    </div>
  `;

  // Initialize components
  initLanguageSelector();
  initFooter();

  // Initialize PongPreview component
  let pongPreview: PongPreview | null = null;

  try {
    pongPreview = new PongPreview('pong-preview-container');
  } catch (error) {
    console.error(' Error initializing PongPreview:', error);
    // Fallback: mostrar contenido estático si hay error
    const container = document.getElementById('pong-preview-container');
    if (container) {
      container.innerHTML = `
        <div class="w-full h-[300px] sm:h-[400px] lg:h-[468px] relative bg-gray-900 rounded-[20px] shadow-[2px_2px_10px_0px_rgba(0,240,255,0.20)] outline outline-2 outline-offset-[-2px] outline-blue-300 overflow-hidden flex items-center justify-center">
          <div class="text-cyan-200 text-lg">Pong Preview Loading...</div>
        </div>
      `;
    }
  }

  // Event listeners
  document.getElementById('playDemoInline')?.addEventListener('click', () => {

    // Detener la preview antes de navegar
    if (pongPreview) {
      pongPreview.stop();
    }

    navigateTo('/demo-inline');
  });

  //Event listener para el botón de torneo de demo
  document.getElementById('playDemoTournament')?.addEventListener('click', async () => {
    navigateTo('/local-tournament/start');
  });

  // Event listener para el botón combinado de login/register
  document.getElementById('loginRegisterBtn')?.addEventListener('click', (e) => {

    // Detener la preview antes de navegar
    if (pongPreview) {
      pongPreview.stop();
    }

    //  MIGRAT: Utilitzar navegació centralitzada
    navigateTo('/login');
  });

  // Navegació amb fletxes del navegador
  // Utilitza la utilitat centralitzada per listeners SPA
  const cleanup = () => {
    if (pongPreview) {
      pongPreview.stop();
    }
  };
  const rerenderLanding = () => { renderLandingPage(); };
  setupSpaCleanupListeners(cleanup, rerenderLanding);
};