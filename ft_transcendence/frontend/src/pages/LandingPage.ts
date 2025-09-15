import { navigateTo } from '../core/router';
import { setUser } from '../core/state';
import { renderLanguageSelector, initLanguageSelector } from '../components/global/LanguageSelector(A)';
import i18n from '../core/i18n';
import { renderFooter, initFooter } from '../components/global/Footer(A)';
import { PongPreview } from '../components/landing/PongPreview(A)';

export const renderLandingPage = (): void => {
  const app = document.getElementById('root');
  if (!app) {
    console.error('Root element not found');
    return;
  }
  
  app.innerHTML = `
    <!-- ✅ Background único usando la clase del CSS -->
    <div class="min-h-screen global-bg p-1/2 relative">
      
      <!-- ✅ Language Selector -->
      <div class="absolute top-4 right-4 z-10">
        ${renderLanguageSelector()}
      </div>

      <!-- ✅ Contenido principal centrado -->
      <div class="min-h-screen flex items-center justify-center overflow-hidden">
        <div class="w-full min-w-[320px]  max-w-[1200px] px-6 py-4 flex flex-col justify-between items-center">
          
          <!-- ✅ Contenido principal -->
          <div class="w-full flex-1 py-7 flex flex-col justify-center items-center gap-10">
            
            <!-- ✅ Header text -->
            <div class="w-full max-w-96 flex flex-col justify-start items-center text-center">
              <div class="text-cyan-200 text-lg font-medium font-['Inter'] mb-2">
                ${i18n.t('landing.title') || 'Welcome to the most EPIC'}
              </div>
              <div class="text-cyan-200 text-3xl sm:text-4xl lg:text-5xl font-bold font-['Inter'] leading-tight">
                PONG GAME
              </div>
            </div>
            
            <!-- ✅ Game preview container - AHORA INDEPENDIENTE Y MÁS ANCHO -->
            <div class="w-full max-w-[400px] lg:max-w-[500px] xl:max-w-[600px]">
              <div id="pong-preview-container" class="w-full">
                <!-- El componente PongPreview se inicializará aquí -->
              </div>
            </div>
            
            <!-- ✅ Buttons section - MANTIENE SU TAMAÑO ORIGINAL -->
            <div class="w-full max-w-96 flex flex-col justify-start items-center gap-3">
              
              <!-- ✅ Play as Guest button -->
              <button id="playDemo" class="w-full h-14 px-6 py-3 bg-cyan-700 hover:bg-cyan-800 rounded-lg flex justify-center items-center transition-colors">
                <div class="text-center text-white text-base sm:text-lg font-bold font-['Inter'] leading-tight">
                  ${i18n.t('demo.playButton') || 'PLAY AS GUEST'}
                </div>
              </button>
              
              <!-- ✅ Login/Register button -->
              <button id="loginRegisterBtn" class="w-full h-14 px-6 py-3 bg-cyan-200 hover:bg-cyan-300 rounded-lg flex justify-center items-center transition-colors">
                <div class="text-center text-teal-800 text-base sm:text-lg font-bold font-['Inter'] leading-tight">
                  ${i18n.t('auth.login') || 'LOGIN or REGISTER'}
                </div>
              </button>
            </div>
          </div>
          
          <!-- ✅ Footer -->
           <div class="w-full flex justify-center">
            ${renderFooter()}
          </div>
        </div>
      </div>
    </div>
  `;

  // ✅ Initialize components
  initLanguageSelector();
  initFooter();
  
  // ✅ Initialize PongPreview component
  let pongPreview: PongPreview | null = null;
  
  try {
    pongPreview = new PongPreview('pong-preview-container');
    console.log('🎮 PongPreview initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing PongPreview:', error);
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
  
  // ✅ Event listeners
  document.getElementById('playDemo')?.addEventListener('click', () => {
    console.log('🎮 Starting demo...');
    
    // ✅ Detener la preview antes de navegar
    if (pongPreview) {
      pongPreview.stop();
    }
    
    // Crear usuario demo con tiempo limitado
    const demoUser = {
      userId: -1, // -1 indica usuario demo
      username: 'Demo Player',
      email: 'demo@localhost',
      isDemoUser: true,
      demoStartTime: Date.now(),
      demoTimeLimit: 2 * 60 * 1000, // 2 minutos en millisegundos
    };
    
    setUser(demoUser);
    navigateTo('/demo-game');
  });

  // ✅ Event listener para el botón combinado de login/register
  document.getElementById('loginRegisterBtn')?.addEventListener('click', () => {
    // ✅ Detener la preview antes de navegar
    if (pongPreview) {
      pongPreview.stop();
    }
    
    // Utilizar la función pública de la App para cambiar vista
    if ((window as any).app) {
      (window as any).app.setCurrentView('login');
    } else {
      // Fallback al router si la app no está disponible
      navigateTo('/login');
    }
  });

  // ✅ Cleanup cuando se navega fuera de la página
  const cleanup = () => {
    if (pongPreview) {
      pongPreview.stop();
      console.log('🧹 PongPreview stopped and cleaned up');
    }
  };

  // ✅ Limpiar cuando se navega a otra página
  window.addEventListener('beforeunload', cleanup);
  window.addEventListener('popstate', cleanup);
};