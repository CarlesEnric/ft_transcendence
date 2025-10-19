import i18n from '../../core/i18n';
import { renderLanguagePopupWindow, renderThemePopupWindow } from '../global/PopupWindow';
import { showEditProfileModal } from './EditProfileModal';

export const renderSidebar = (): string => `
	<button id="open-sidebar" 
  		class="fixed top-4 left-4 z-50 w-12 h-12 bg-gray-900 border border-white rounded-lg 
        	flex flex-col items-center justify-center gap-1 hover:bg-cyan-100/20 transition">
  		<span class="block w-6 h-0.5 bg-cyan-500 rounded"></span>
  		<span class="block w-6 h-0.5 bg-cyan-500 rounded"></span>
  		<span class="block w-6 h-0.5 bg-cyan-500 rounded"></span>
  		<span class="block w-6 h-0.5 bg-cyan-500 rounded"></span>
	</button>

  <!-- Overlay con blur para el sidebar -->
  <div id="sidebar-overlay" 
       class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 opacity-0 transition-all duration-300 hidden">
  </div>

  <aside id="dashboard-sidebar" 
  	class="global-bg fixed top-0 left-0 z-50 w-90 h-full p-10 shadow-2xl transition-transform duration-320 -translate-x-full">
    <div class="h-full flex flex-col justify-between items-start">
      <div class="flex flex-col gap-2 w-full">

	<!-- Profile -->
	<button id="sidebar-profile" class="w-67 flex items-center gap-4 px-2 py-3 hover:bg-cyan-100/20 rounded transition">
  		<img src="/icons/profile_bg_circle.png" alt="Profile" class="w-11 h-11" />
  		<span class="text-white text-1xl font-medium font-['Inter']">
    		${i18n.t('Profile') || 'Perfil'}
  		</span>
	</button>

	<!-- Language -->
	<button id="sidebar-language" class="w-67 flex items-center gap-4 px-2 py-3 hover:bg-cyan-100/20 rounded transition">
  		<img src="/icons/language_bg_circle.png" alt="Language" class="w-11 h-11" />
  		<span class="text-white text-1xl font-medium font-['Inter']">
    		${i18n.t('Language') || 'Idioma'}
  		</span>
	</button>

	<!-- Theme -->
	<button id="sidebar-theme" class="w-67 flex items-center gap-4 px-2 py-3 hover:bg-cyan-100/20 rounded transition">
		<img src="/icons/night_bg_circle.png" alt="Theme" class="w-11 h-11" />
		<span class="text-white text-1xl font-medium font-['Inter']">
			${i18n.t('Theme') || 'Modo'}
		</span>
	</button>

	<!-- X //COMMENTED: Logout -->
	<!-- button id="sidebar-logout" class="w-full flex items-center gap-4 py-3 hover:bg-cyan-100/20 rounded transition">
	<img src="../icons/logout.png" alt="Logout" class="w-8 h-8" />
		<span class="text-white text-1xl font-medium font-['Inter']">
    		${i18n.t('sidebar.logout') || 'Salir'}
  		</span>
	</button -->

	<!-- X button (close sidebar) -->
	<button id="close-sidebar" 
  		class="fixed top-4 right-4 z-50 w-8 h-8 bg-gray-900 border border-white rounded-lg 
         flex items-center justify-center hover:bg-cyan-100/20 transition">
  		<span class="absolute w-6 h-0.5 bg-cyan-500 rounded rotate-45"></span>
  		<span class="absolute w-6 h-0.5 bg-cyan-500 rounded -rotate-45"></span>
	</button>
  </aside>
`;


// Helper to remove all event listeners by replacing elements (idempotent re-attach)
function replaceElementWithClone(id: string) {
	const oldEl = document.getElementById(id);
	if (!oldEl) return null;
	const newEl = oldEl.cloneNode(true) as HTMLElement;
	oldEl.parentNode?.replaceChild(newEl, oldEl);
	return newEl;
}

export const initSidebar = async (): Promise<void> => {
	const sidebar = document.getElementById('dashboard-sidebar');
	const overlay = document.getElementById('sidebar-overlay');
	const openBtn = replaceElementWithClone('open-sidebar');
	const closeBtn = replaceElementWithClone('close-sidebar');
	const profileBtn = replaceElementWithClone('sidebar-profile');
	const languageBtn = replaceElementWithClone('sidebar-language');
	const themeBtn = replaceElementWithClone('sidebar-theme');

	openBtn?.addEventListener('click', () => {
		// Mostrar overlay con blur
		if (overlay) {
			overlay.style.display = 'block';
			setTimeout(() => {
				overlay.classList.remove('opacity-0');
				overlay.classList.add('opacity-100');
			}, 10);
		}
		
		// Mostrar sidebar
		sidebar?.classList.remove('-translate-x-full');
		sidebar?.classList.add('translate-x-0');
	});
	
	const closeSidebar = () => {
		// Ocultar sidebar
		sidebar?.classList.remove('translate-x-0');
		sidebar?.classList.add('-translate-x-full');
		
		// Ocultar overlay
		if (overlay) {
			overlay.classList.remove('opacity-100');
			overlay.classList.add('opacity-0');
			setTimeout(() => {
				overlay.style.display = 'none';
			}, 300);
		}
	};
	
	closeBtn?.addEventListener('click', closeSidebar);
	
	// Cerrar sidebar al hacer click en el overlay
	overlay?.addEventListener('click', closeSidebar);
	
	profileBtn?.addEventListener('click', () => {
		closeSidebar();
		setTimeout(() => {
			showEditProfileModal();
		}, 300);
	});
	
	languageBtn?.addEventListener('click', () => {
		closeSidebar();
		setTimeout(() => {
			renderLanguagePopupWindow();
			document.getElementById("language-modal")?.classList.remove("hidden");
		}, 320);
	});
	
	themeBtn?.addEventListener('click', () => {
		closeSidebar();
		setTimeout(() => {
			renderThemePopupWindow();
			document.getElementById("theme-modal")?.classList.remove("hidden");
		}, 320);
	});

	// Remove previous keydown listener by using a named function and removing it first
	const keydownHandler = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			closeSidebar();
		}
	};
	document.removeEventListener('keydown', keydownHandler);
	document.addEventListener('keydown', keydownHandler);

};

export const resetSidebar = (): void => {
	// No-op, kept for compatibility
};
