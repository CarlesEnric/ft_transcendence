/**
 * Views Manager - Gestió centralitzada de renderitzat de vistes
 * Migrat de GameEngine.ts per modularitat
 */

// Renderitzat del formulari 2FA (migrat de GameEngine.ts)
export const render2FAView = (): string => {
  return `
    <div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div class="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
        <div class="text-center mb-8">
          <div class="text-6xl mb-4"></div>
          <h1 class="text-3xl font-bold text-white mb-2">Verificació 2FA</h1>
          <p class="text-gray-300">Introdueix el codi de l'aplicació d'autenticació</p>
        </div>
        
        <form id="twofa-form" class="space-y-6">
          <div>
            <label class="block text-white text-sm font-medium mb-2">Codi de verificació</label>
            <input 
              type="text" 
              id="twofa-code" 
              maxlength="6"
              pattern="[0-9]{6}"
              required
              autocomplete="one-time-code"
              class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-2xl font-mono tracking-widest placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="• • • • • • "
              autofocus
            >
            <p class="text-gray-400 text-xs mt-2">Introdueix el codi de 6 dígits de la teva aplicació d'autenticació</p>
          </div>
          
          <button 
            type="submit"
            class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition duration-300 transform hover:scale-105"
          >
            Verificar
          </button>
        </form>
        
        <div class="mt-6 text-center">
          <p class="text-gray-400 text-sm">
            No pots accedir? 
            <a href="#" class="text-cyan-300 hover:text-cyan-200 transition-colors" data-action="contact-admin">
              Necessites ajuda?
            </a>
          </p>
        </div>
      </div>
    </div>
  `;
};

// Funció per renderitzar una vista al contenidor principal
export const renderViewToContainer = (viewHtml: string, containerId: string = 'app'): void => {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = viewHtml;
    
    // Inicialitzar event listeners d'autenticació després del renderitzat
    setTimeout(() => {
      // Importem dinàmicament per evitar dependències circulars
      import('./auth-frontend').then(auth => {
        auth.initAuthEventListeners();
      });
    }, 50);
    
    // Delegated handler for data-action elements (CSP friendly)
    const delegatedClick = (ev: Event) => {
      const target = ev.target as HTMLElement;
      if (!target) return;
      const actionEl = target.closest('[data-action]') as HTMLElement | null;
      if (!actionEl) return;
      const action = actionEl.getAttribute('data-action');
      if (action === 'contact-admin') {
        // Non-inline handler for help link
        ev.preventDefault();
        alert("Contacta amb l'administrador per obtenir ajuda.");
      }
    };

    // ensure we don't attach multiple times
    container.removeEventListener('click', delegatedClick);
    container.addEventListener('click', delegatedClick);
  } else {
    console.error(`Container with id '${containerId}' not found`);
  }
};