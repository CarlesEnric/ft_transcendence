//import { navigateTo } from '../../core/router';
import { setTheme, getState } from '../../core/state';
import i18n from '../../core/i18n';
//import { renderHomePage } from '../../pages/HomePage';

export const renderThemePopupWindow = (): void => {
	document.getElementById('theme-modal')?.remove();

	const theme_popup = `
		<div id="theme-modal" 
    	class="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
    	<div id="theme-modal-content" class="bg-white text-black rounded-2xl shadow-lg px-6 py-4.5 w-120">
      		<h2 class="text-lg font-semibold mb-4">${i18n.t('Theme') || 'Modo'}</h2>
      		<h3 class="text-sm text-gray-500 mb-4">${i18n.t('Select the theme what you want') || 'Selecciona el tema que deseas'}</h3>
		
			<!-- Selection box: select theme -->
			<form class=" mx-auto w-full">

 				<div class="relative">
   		 			<select id="box_theme"
      					class="appearance-none bg-white border border-gray-300 text-gray-500 hover:border-blue-600 text-sm rounded-lg block w-full p-2.5 pr-4">
      					<option value="" disabled selected hidden>${i18n.t('Select a theme') || 'Selecciona un tema'}</option>
      					<option value="dark_theme">${i18n.t('Dark') || 'Oscuro'}</option>
      					<option value="light_theme">${i18n.t('Light') || 'Claro'}</option>
    				</select>
    
    				<!-- Custom arrow -->
    				<div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
      					<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" stroke-width="2"
          					viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        					<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
     					</svg>
    				</div>

  				</div>
			</form>

			<!-- Buttons close/save -->
			<div class="flex justify-end space-x-3">
    			<button id="close-theme-modal" 
    				class="mt-9 w-20 py-1 bg-white rounded-lg hover:bg-red-500 text-black hover:text-gray-950 border border-gray-800/20">
        			${i18n.t('Cancel') || 'Cancelar'}
      			</button>
    			<button id="save-theme-modal" 
    				class="mt-9 w-20 py-1 bg-blue-600 rounded-lg text-white hover:text-white/80 hover:border hover:border-gray-800/20">
        			${i18n.t('Save') || 'Guardar'}
      			</button>
			</div>
    	</div>
	</div>
	`;
	document.body.insertAdjacentHTML('beforeend', theme_popup);

	document.getElementById('close-theme-modal')?.addEventListener('click', () => {
    	document.getElementById('theme-modal')?.remove();
    });

	document.addEventListener("click", (e) => {
		const target = e.target as HTMLElement;
  		//PRESS: Save button
  		if (target.id === "save-theme-modal") {
    		const selectEl = document.getElementById("box_theme") as HTMLSelectElement | null;

    		if (selectEl) {
      			const selected = selectEl.value;

     		 	if (selected === "dark_theme") {
        			setTheme('dark');
				}
				else if (selected === "light_theme") {
        			setTheme('light');
					
					// Forzar aplicación visual inmediata
					setTimeout(() => {
						const currentTheme = document.documentElement.getAttribute('data-theme');
						
						// Si el tema no se aplica visualmente, recargar la página
						const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary');
						
						if (bgColor.trim() === '#071016' || bgColor.trim() === 'rgb(7, 16, 22)') {
							window.location.reload();
						}
					}, 100);
      			}
				else {
        			const curr_state = getState();
					setTheme(curr_state.theme);//Keep current theme 
      			}
   			}
   			document.getElementById("theme-modal")?.remove();
		}
		//PRESS: Cancel button
		if (target.id === "close-theme-modal") {
	    	document.getElementById("theme-modal")?.remove();
	  	}
	});

	const modal = document.getElementById("theme-modal")!;
	const modalContent = document.getElementById("theme-modal-content")!;

	modal.addEventListener("click", (e) => {
		if (!modalContent.contains(e.target as Node)) {
			modal.remove();
		}
	});
};

export const renderLanguagePopupWindow = (): void => {
	document.getElementById('language-modal')?.remove();

	const language_popup = `
		<div id="language-modal" 
    	class="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
    	<div id="language-modal-content" class="bg-white text-black rounded-2xl shadow-lg px-6 py-4.5 w-120">
      		<h2 class="text-lg font-semibold mb-4">${i18n.t('Language') || 'Idioma'}</h2>
      		<h3 class="text-sm text-gray-500 mb-4">${i18n.t('Select the language you want') || 'Selecciona el idioma que deseas'}</h3>

			<!-- Selection box: select theme -->
			<form class=" mx-auto w-full">

 				<div class="relative">
   		 			<select id="box_language"
      					class="appearance-none bg-white border border-gray-300 text-gray-500 hover:border-blue-600 text-sm rounded-lg block w-full p-2.5 pr-4">
      					<option value="" disabled selected hidden>${i18n.t('Select your language') || 'Selecciona tu idioma'}</option>
      					<option value="cat_language">${i18n.t('Catalan') || 'Catalán'}</option>
      					<option value="esp_language">${i18n.t('Spanish') || 'Español'}</option>
      					<option value="eng_language">${i18n.t('English') || 'Inglés'}</option>
      					<option value="fra_language">${i18n.t('French') || 'Francés'}</option>
    				</select>
    
    				<!-- Custom arrow -->
    				<div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
      					<svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" stroke-width="2"
          					viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        					<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
     					</svg>
    				</div>

  				</div>
			</form>

			<!-- Buttons close/save -->
			<div class="flex justify-end space-x-3">
    			<button id="close-language-modal" 
    				class="mt-9 w-20 py-1 bg-white rounded-lg hover:bg-red-500 text-black hover:text-gray-950 border border-gray-800/20">
        			${i18n.t('Cancel') || 'Cancelar'}
      			</button>
    			<button id="save-language-modal" 
    				class="mt-9 w-20 py-1 bg-blue-600 rounded-lg text-white hover:text-white/80 hover:border hover:border-gray-800/20">
        			${i18n.t('Save') || 'Guardar'}
      			</button>
			</div>
    	</div>
	</div>
	`;

	document.body.insertAdjacentHTML('beforeend', language_popup);
	document.getElementById('close-language-modal')?.addEventListener('click', () => {
    	document.getElementById('language-modal')?.remove();
    });

	document.addEventListener("click", (e) => {
		const target = e.target as HTMLElement;
  		//PRESS: Save button
  		if (target.id === "save-language-modal") {
    		const selectEl = document.getElementById("box_language") as HTMLSelectElement | null;

    		if (selectEl) {
      			const selected = selectEl.value;
				let newLanguage = '';

     		 	if (selected === "cat_language") {
        			newLanguage = 'ca';
				}
				else if (selected === "esp_language") {
        			newLanguage = 'es';
      			}
				else if (selected === "eng_language") {
        			newLanguage = 'en';
      			}
				else if (selected === "fra_language") {
        			newLanguage = 'fr';
      			}
				else {
        			alert(i18n.t('Language not chosen') || 'Idioma no seleccionado');
					document.getElementById("language-modal")?.remove();
					return;
      			}
				
				// Cambiar idioma usando i18n
				i18n.changeLanguage(newLanguage).then(() => {
					// Guardar preferencia en localStorage
					localStorage.setItem('preferredLanguage', newLanguage);
					
					// Recargar la página para aplicar los cambios
					window.location.reload();
				});
   			}
   			document.getElementById("language-modal")?.remove();
		}
		//PRESS: Cancel button
		if (target.id === "close-language-modal") {
	    	document.getElementById("language-modal")?.remove();
	  	}
	});

	//Click outside of window: quit window
	const modal = document.getElementById("language-modal")!;
	const modalContent = document.getElementById("language-modal-content")!;

	modal.addEventListener("click", (e) => {
		if (!modalContent.contains(e.target as Node)) {
			modal.remove();
		}
	});
};