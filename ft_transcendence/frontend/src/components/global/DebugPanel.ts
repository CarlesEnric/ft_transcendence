/**
 * Panell de debugació per mostrar info sobre la configuració
 */
import { API_CONFIG } from '../../config/api';

export function renderDebugPanel() {
  return `
    <div class="fixed bottom-0 left-0 z-50 bg-gray-900 text-white p-2 rounded-tr-md text-xs opacity-50 hover:opacity-100 transition-opacity">
      <button id="debug-toggle" class="text-cyan-400">Debug Info ▼</button>
      <div id="debug-content" class="hidden mt-2">
        <div><strong>CONFIG:</strong></div>
        <div>DOMAIN: ${API_CONFIG.DOMAIN}</div>
        <div>GOOGLE_URL: ${API_CONFIG.AUTH.GOOGLE}</div>
        <div>API_URL: ${API_CONFIG.AUTH.PROFILE}</div>
        <div>WS_URL: ${API_CONFIG.GAME.WS}</div>
        <div class="mt-2"><strong>TECH:</strong></div>
        <div>User Agent: ${navigator.userAgent.substring(0, 50)}...</div>
        <div>Viewport: ${window.innerWidth}x${window.innerHeight}</div>
      </div>
    </div>
  `;
}

export function initDebugPanel() {
  const toggle = document.getElementById('debug-toggle');
  const content = document.getElementById('debug-content');
  
  if (toggle && content) {
    toggle.addEventListener('click', () => {
      if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        toggle.textContent = 'Debug Info ▲';
      } else {
        content.classList.add('hidden');
        toggle.textContent = 'Debug Info ▼';
      }
    });
  }
}