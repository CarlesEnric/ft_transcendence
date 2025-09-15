import { navigateTo } from '../../core/router';
import { setUser, setTheme, getState } from '../../core/state';
import i18n from '../../core/i18n';
import { renderHomePage } from '../../pages/HomePage';

export const renderSidebar = (): string => `
  <aside id="dashboard-sidebar" class="global-bg fixed top-0 left-0 z-50 w-96 h-full p-10 shadow-2xl transition-transform duration-300">
    <div class="h-full flex flex-col justify-between items-start">
      <div class="flex flex-col gap-10 w-full">
        <button id="sidebar-settings" class="w-full flex items-center gap-4 py-3 hover:bg-cyan-100/20 rounded transition">
          <span class="material-icons text-teal-800 text-4xl">settings</span>
          <span class="text-white text-2xl font-medium font-['Inter']">${i18n.t('sidebar.settings') || 'Ajustes'}</span>
        </button>
        <button id="sidebar-friends" class="w-full flex items-center gap-4 py-3 hover:bg-cyan-100/20 rounded transition">
          <span class="material-icons text-teal-800 text-4xl">group</span>
          <span class="text-white text-2xl font-medium font-['Inter']">${i18n.t('sidebar.friends') || 'Mis amigos'}</span>
        </button>
        <button id="sidebar-language" class="w-full flex items-center gap-4 py-3 hover:bg-cyan-100/20 rounded transition">
          <span class="material-icons text-teal-800 text-4xl">language</span>
          <span class="text-white text-2xl font-medium font-['Inter']">${i18n.t('sidebar.language') || 'Idiomas'}</span>
        </button>
        <button id="sidebar-theme" class="w-full flex items-center gap-4 py-3 hover:bg-cyan-100/20 rounded transition">
          <span class="material-icons text-teal-800 text-4xl">dark_mode</span>
          <span class="text-white text-2xl font-medium font-['Inter']">${i18n.t('sidebar.theme') || 'Modo'}</span>
        </button>
      </div>
      <button id="sidebar-logout" class="w-full flex items-center gap-4 py-3 hover:bg-cyan-100/20 rounded transition">
        <span class="material-icons text-teal-800 text-4xl">logout</span>
        <span class="text-white text-2xl font-medium font-['Inter']">${i18n.t('sidebar.logout') || 'Salir'}</span>
      </button>
    </div>
    <button id="close-sidebar" class="absolute top-4 right-4 text-cyan-400 hover:text-cyan-300 text-3xl">&times;</button>
  </aside>
`;

export const initSidebar = (): void => {
  const state = getState();

  document.getElementById('sidebar-settings')?.addEventListener('click', () => {
    alert('Ajustes (puedes abrir un modal o sección)');
  });

  document.getElementById('sidebar-friends')?.addEventListener('click', () => {
    navigateTo('/dashboard/friends');
  });

  document.getElementById('sidebar-language')?.addEventListener('click', () => {
    alert('Selector de idioma (puedes abrir un modal o menú)');
  });

   document.getElementById('sidebar-theme')?.addEventListener('click', () => {
    setTheme(state.theme === 'dark' ? 'light' : 'dark');
    renderHomePage(); // O window.location.reload() si prefieres recargar todo
  });


  document.getElementById('sidebar-logout')?.addEventListener('click', () => {
    setUser(null);
    navigateTo('/');
  });

  document.getElementById('close-sidebar')?.addEventListener('click', () => {
    document.getElementById('dashboard-sidebar')?.remove();
  });
};