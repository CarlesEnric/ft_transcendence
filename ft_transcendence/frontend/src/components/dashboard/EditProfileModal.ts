import i18n from '../../core/i18n';
import { navigateTo, navigateToView } from '../../core/router';
//  Importem la gestió d'autenticació centralitzada
import { showTwoFactorSetup, showTwoFactorDisable, showToast } from '../../core/auth-frontend';
import { setUser, getState } from '../../core/state';
import { API_CONFIG } from '../../config/api';
import { USER_SERVICE } from '../../config/userApi';
import { renderHeaderCard } from './HeaderCard';

// SPA: Reset function to clean up listeners and state
export function resetEditProfileModal() {
  editProfileModalInitialized = false;
  closeEditProfileModal();
}

let is2FAEnabled = false; // estado inicial
let isGoogleAccount = false; // detectar comptes de Google

//  Funció per eliminar el compte de l'usuari
const deleteAccount = async (): Promise<boolean> => {
  try {

    const response = await fetch(API_CONFIG.AUTH.DELETE_ACCOUNT, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (response.ok) {
      const data = await response.json();
      showToast(i18n.t('editProfile.accountDeleted') || 'Compte eliminat correctament', 'success');
      
      //  Netejar l'estat local i redirigir
      setTimeout(() => {
        // Netejar l'estat d'autenticació si tenim la funció disponible
        try {
          // Si tenim accés a la funció de logout del core/auth
          import('../../core/auth-frontend').then(({ handleLogout }) => {
            handleLogout();
          }).catch(() => {
            // Si no està disponible, simplement naveguem
            navigateTo('/');
          });
        } catch {
          navigateTo('/');
        }
      }, 2000);
      
      return true;
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(' Error deleting account:', response.status, errorData);
      showToast(`Error eliminant el compte: ${errorData.error || 'Error desconegut'}`, 'error');
      return false;
    }
  } catch (error) {
    console.error(' Error deleting account:', error);
    showToast('Error de connexió eliminant el compte', 'error');
    return false;
  }
};

export const renderEditProfileModal = (): string => `
  <!--  Modal Overlay con blur effect -->
    <!-- Backdrop blur -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-md" id="modalBackdrop"></div>
    
    <!-- Modal Content -->
    <div class="relative w-full max-w-[450px] sm:max-w-[500px] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-gray-900 rounded-[15px] sm:rounded-[20px] shadow-[2px_2px_20px_0px_rgba(0,240,255,0.40)] outline outline-2 outline-offset-[-2px] outline-blue-300 p-4 sm:p-7">
      
      <!--  Close Button -->
      <button id="closeModal" class="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 bg-red-500 hover:bg-red-800 rounded-full flex items-center justify-center text-white text-base sm:text-lg font-bold transition-colors">
        ×
      </button>

      <!--  Header Section -->
      <div class="flex flex-col justify-center items-center gap-2 mb-4 sm:mb-6">
        <!-- Avatar with edit -->
        <div class="relative w-24 h-24 sm:w-32 sm:h-32">
          <img id="avatarPreview" src="/images/avatar1.png" alt="avatar" class="w-full h-full rounded-full border-2 border-cyan-400 object-cover"/>
          <!--  CORREGIR: Input file oculto + botón visible -->
          <input type="file" id="avatarFileInput" accept="image/*" class="hidden" />
          <button id="editAvatarBtn" type="button" class="absolute bottom-0 right-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white text-xs flex items-center justify-center transition-colors">
            <img src="/icons/pencil.png" alt="Edit Icon" class="w-3 h-3 sm:w-4 sm:h-4">
          </button>
        </div>
        <div class="text-center"> 
          <div class="text-white text-lg sm:text-xl font-semibold">${i18n.t('editProfile.title') || 'Editar perfil'}</div>
          <div class="text-gray-300 text-xs sm:text-sm">${i18n.t('editProfile.subtitle') || 'Actualiza tu foto y tus datos aquí.'}</div>
        </div>
      </div>

      <!--  Edit Form -->
      <form id="editProfileForm" class="flex flex-col gap-3 sm:gap-4">
        
        <!-- Usuario y Nombre en fila (responsive) -->
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
        
          <!-- Usuario -->
          <div class="w-full sm:w-1/2">
            <label for="username" class="text-white text-xs sm:text-sm font-medium block mb-1">${i18n.t('editProfile.username') || 'Usuario'}</label>
            <input type="text" id="username" name="username" class="w-full h-9 sm:h-10 px-3 bg-white text-black text-sm rounded-md outline outline-1 outline-gray-600 focus:outline-cyan-400 transition-colors" placeholder="MyUser"/>
          </div>

          <!-- Nombre -->
          <div class="w-full sm:w-1/2">
            <label for="name" class="text-white text-xs sm:text-sm font-medium block mb-1">${i18n.t('editProfile.name') || 'Nombre'}</label>
            <input type="text" id="name" name="name" class="w-full h-9 sm:h-10 px-3 bg-white text-black text-sm rounded-md outline outline-1 outline-gray-600 focus:outline-cyan-400 transition-colors" placeholder="MyName"/>
          </div>
        </div>

        <!-- Apellidos -->
        <div>
          <label for="lastname" class="text-white text-xs sm:text-sm font-medium block mb-1">${i18n.t('editProfile.lastname') || 'Apellidos'}</label>
          <input type="text" id="lastname" name="lastname" class="w-full h-9 sm:h-10 px-3 bg-white text-black text-sm rounded-md outline outline-1 outline-gray-600 focus:outline-cyan-400 transition-colors" placeholder="MyLastName"/>
        </div>

        <!-- Correo -->
        <div>
          <label for="email" class="text-white text-xs sm:text-sm font-medium block mb-1">${i18n.t('editProfile.email') || 'Correo'}</label>
          <input type="email" id="email" name="email" class="w-full h-9 sm:h-10 px-3 bg-white text-black text-sm rounded-md outline outline-1 outline-gray-600 focus:outline-cyan-400 transition-colors" placeholder="MyEmail"/>
        </div>

        <!-- Contraseña -->
        <div>
          <label for="password" class="text-white text-xs sm:text-sm font-medium block mb-1">${i18n.t('editProfile.password') || 'Contraseña'}</label>
          <input type="password" id="password" name="password" class="w-full h-9 sm:h-10 px-3 bg-white text-black text-sm rounded-md outline outline-1 outline-gray-600 focus:outline-cyan-400 transition-colors" placeholder=" • • • • • • • • "/>
        </div>

        <!-- Save Button -->
        <div class="mt-2 sm:mt-4">
          <button type="submit" class="w-full h-10 sm:h-11 bg-cyan-200 hover:bg-cyan-300 text-teal-800 text-sm sm:text-base font-bold rounded-lg transition-colors">
            ${i18n.t('editProfile.save') || 'GUARDAR'}
          </button>
        </div>

      </form>

      <!--  DANGER ZONE Section -->
      <div class="mt-4 sm:mt-6 pt-2 sm:pt-4 border-t border-gray-700">
        <h3 class="text-red-400 text-sm sm:text-base font-bold mb-3 sm:mb-4 flex items-center gap-2">
          <span class="text-red-500">⚠️</span>
          ${i18n.t('editProfile.dangerZone') || 'Danger Zone'}
        </h3>
        
        <!-- Danger Zone Content -->
        <div class="flex flex-col gap-3 sm:gap-4">
          
          <!--  2FA Toggle CORREGIDO -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-2 bg-gray-800/50 rounded-lg border border-gray-700">
            <div class="flex-1">
              <div class="text-white text-xs sm:text-sm font-medium">${i18n.t('editProfile.twoFactorAuth') || 'Autenticación de dos factores'}</div>
              <div class="text-gray-400 text-xs mt-1">${i18n.t('editProfile.twoFactorDesc') || 'Añade una capa extra de seguridad a tu cuenta'}</div>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex flex-col items-center gap-1 cursor-pointer" id="twoFASwitch">
                <!--  CORREGIR: Toggle track más ancho para acomodar el movimiento -->
                <div id="twoFASwitchTrack"
                    class="relative w-12 h-6 sm:w-14 sm:h-7 bg-red-600/70 rounded-full flex items-center transition-colors duration-300 overflow-hidden">
                  <!--  CORREGIR: Thumb con positioning absoluto -->
                  <div id="twoFASwitchThumb"
                      class="absolute w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full shadow-lg transition-transform duration-300 transform translate-x-0.5"></div>
                </div>
                <div id="twoFASwitchLabel" class="text-red-400 text-xs font-medium">${i18n.t('editProfile.twoFADisabled') || 'Desactivado'}</div>
              </div>
            </div>
          </div>

          <!-- Delete Account Button -->
          <div class="p-3 bg-red-900/20 rounded-lg border border-red-800/50">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <div class="flex-1">
                <div class="text-white text-xs sm:text-sm font-medium">${i18n.t('editProfile.deleteAccountTitle') || 'Eliminar cuenta'}</div>
                <div class="text-gray-400 text-xs mt-1">${i18n.t('editProfile.deleteAccountDesc') || 'Esta acción no se puede deshacer. Se eliminarán todos tus datos.'}</div>
              </div>
              <button type="button" id="deleteAccount" class="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 bg-red-600/30 hover:bg-red-700/50 rounded-lg text-white text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                <img src="/icons/delete.png" alt="Delete Icon" class="w-4 h-4"> 
                ${i18n.t('editProfile.deleteAccount') || 'Eliminar cuenta'}
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
`;

//  CORREGIR: Variables globales para cleanup

let modalKeydownHandler: ((e: KeyboardEvent) => void) | null = null;
let modalCleanupCallbacks: (() => void)[] = [];
let editProfileModalInitialized = false;


export const initEditProfileModal = async (): Promise<void> => {
  if (editProfileModalInitialized) return;
  editProfileModalInitialized = true;

  //  LIMPIAR: Event listeners anteriores antes de añadir nuevos
  cleanupModalEventListeners();

  //  Carregar estat inicial del 2FA
  await load2FAStatus();

  // 👤 Carregar dades del perfil de l'usuari
  await loadUserProfile();

  //  Close modal events
  const closeModalBtn = document.getElementById('closeModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const closeHandler = () => closeEditProfileModal();
  closeModalBtn?.addEventListener('click', closeHandler);
  modalBackdrop?.addEventListener('click', closeHandler);
  modalCleanupCallbacks.push(() => {
    closeModalBtn?.removeEventListener('click', closeHandler);
    modalBackdrop?.removeEventListener('click', closeHandler);
  });

  //  NUEVO: Avatar file selection
  const avatarFileInput = document.getElementById('avatarFileInput') as HTMLInputElement;
  const editAvatarBtn = document.getElementById('editAvatarBtn');
  const avatarPreview = document.getElementById('avatarPreview') as HTMLImageElement;
  const avatarChangeHandler = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
        showToast(i18n.t('editProfile.invalidImageType') || 'Por favor selecciona una imagen válida.', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast(i18n.t('editProfile.imageTooLarge') || 'La imagen es demasiado grande. Máximo 5MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        if (avatarPreview && e.target?.result) {
          avatarPreview.src = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const editAvatarClickHandler = () => {
    avatarFileInput?.click();
  };
  editAvatarBtn?.addEventListener('click', editAvatarClickHandler);
  avatarFileInput?.addEventListener('change', avatarChangeHandler);
  modalCleanupCallbacks.push(() => {
    editAvatarBtn?.removeEventListener('click', editAvatarClickHandler);
    avatarFileInput?.removeEventListener('change', avatarChangeHandler);
  });

  //  Form submit
  const editProfileForm = document.getElementById('editProfileForm');
  const formSubmitHandler = async (e: Event) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const success = await updateProfile(formData);
    if (success) {
      const avatarFile = avatarFileInput?.files?.[0];
      if (avatarFile) {
        const debugToast = (msg: string) => showToast('[DEBUG] ' + msg, 'info');
        try {
          const avatarForm = new FormData();
          avatarForm.append('avatar', avatarFile);
          const avatarRes = await fetch(USER_SERVICE.AVATAR_UPLOAD, {
            method: 'POST',
            credentials: 'include',
            body: avatarForm,
          });
          if (avatarRes.ok) {
            const data = await avatarRes.json();
            debugToast('Avatar upload response: ' + JSON.stringify(data));
            const prevUser = getState().user;
            if (prevUser) {
              setUser({ ...prevUser, avatar_url: data.avatar_url });
              debugToast('setUser avatar_url: ' + data.avatar_url);
            }
            if (avatarPreview && data.avatar_url) {
              avatarPreview.src = data.avatar_url;
              debugToast('Avatar preview src: ' + avatarPreview.src);
            }
            showToast(i18n.t('editProfile.avatarUpdated') || 'Avatar actualizado con éxito!', 'success');
          } else {
            const err = await avatarRes.json().catch(() => ({}));
            console.error('🔴 Avatar upload error:', err);
            debugToast('Avatar upload error: ' + JSON.stringify(err));
            showToast(err.error || 'Error al subir el avatar', 'error');
          }
        } catch (err) {
          console.error('🔴 Avatar upload connection error:', err);
          debugToast('Avatar upload connection error: ' + String(err));
          showToast('Error de conexión subiendo el avatar', 'error');
        }
      }
      setTimeout(() => {
        closeEditProfileModal();
      }, 1500);
    }
  };
  editProfileForm?.addEventListener('submit', formSubmitHandler);
  modalCleanupCallbacks.push(() => {
    editProfileForm?.removeEventListener('submit', formSubmitHandler);
  });

  //  Delete account
  const deleteAccountBtn = document.getElementById('deleteAccount');
  const deleteHandler = async () => {
    const confirmMessage = i18n.t('editProfile.deleteConfirm') || 'Segur que vols eliminar el teu compte? Aquesta acció no es pot desfer.';
    if (confirm(confirmMessage)) {
      const success = await deleteAccount();
      if (success) {
        closeEditProfileModal();
      }
    }
  };
  deleteAccountBtn?.addEventListener('click', deleteHandler);
  modalCleanupCallbacks.push(() => {
    deleteAccountBtn?.removeEventListener('click', deleteHandler);
  });

  //  Close on ESC key
  modalKeydownHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeEditProfileModal();
    }
  };
  document.addEventListener('keydown', modalKeydownHandler);

  //  Toggle 2FA Switch CORREGIDO
  const switchEl = document.getElementById('twoFASwitch');
  const switchHandler = async () => {
    if (!is2FAEnabled) {
      await show2FASetupModal();
    } else {
      await show2FADisableModal();
    }
  };
  switchEl?.addEventListener('click', switchHandler);
  modalCleanupCallbacks.push(() => {
    switchEl?.removeEventListener('click', switchHandler);
  });

};

//  Funció per carregar l'estat actual del 2FA
const load2FAStatus = async (): Promise<void> => {
  try {
    const response = await fetch(API_CONFIG.AUTH.TWO_FA.STATUS, { 
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      update2FAToggle(data.enabled || false);
    } else {
      console.error(' Error loading 2FA status:', response.status);
    }
  } catch (error) {
    console.error(' Error loading 2FA status:', error);
  }
};

// � Funció per aplicar restriccions a comptes de Google
const applyGoogleAccountRestrictions = (): void => {
  
  // Deshabilitar camps d'entrada
  const inputs = ['username', 'name', 'lastname', 'email', 'password'];
  inputs.forEach(inputId => {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.disabled = true;
      input.style.opacity = '0.6';
    }
  });

  // Deshabilitar botó de guardar
  const saveButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
  if (saveButton) {
    saveButton.disabled = true;
    saveButton.style.opacity = '0.6';
    saveButton.textContent = 'Compte de Google - No editable';
  }

  // Mostrar missatge informatiu amb showToast
  showToast('🔒 Compte de Google: Només pots eliminar el compte, no modificar les dades', 'info');
};

//  Funció per carregar les dades del perfil de l'usuari

// �👤 Funció per carregar les dades del perfil de l'usuari
const loadUserProfile = async (): Promise<void> => {
  try {
    
    const response = await fetch(API_CONFIG.AUTH.PROFILE, {
      method: 'GET',
      credentials: 'include',
        headers: { 
          'Accept': 'application/json'
        }
    });

    if (response.ok) {
      const data = await response.json();

      if (data.success && data.user) {
        // 🔍 Detectar tipus de compte
        isGoogleAccount = data.user.provider === 'google';
        
        // Omplim els camps del formulari amb les dades del backend
        const usernameInput = document.getElementById('username') as HTMLInputElement;
        const nameInput = document.getElementById('name') as HTMLInputElement;
        const lastnameInput = document.getElementById('lastname') as HTMLInputElement;
        const emailInput = document.getElementById('email') as HTMLInputElement;
        const avatarPreview = document.getElementById('avatarPreview') as HTMLImageElement;

        if (usernameInput) usernameInput.value = data.user.username || '';
        if (nameInput) nameInput.value = data.user.firstName || '';
        if (lastnameInput) lastnameInput.value = data.user.lastName || '';
        if (emailInput) emailInput.value = data.user.email || '';
        
        // Actualitzar avatar si està disponible
        if (avatarPreview && data.user.avatar_url) {
          avatarPreview.src = data.user.avatar_url;
        }

        // 🚫 Aplicar restriccions si és compte de Google
        if (isGoogleAccount) {
          applyGoogleAccountRestrictions();
        }

      }
    } else {
      console.error(' Error loading profile:', response.status);
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      showToast(`Error carregant el perfil: ${errorData.error || 'Error desconegut'}`, 'error');
    }
  } catch (error) {
    console.error(' Error loading user profile:', error);
    showToast('Error de connexió carregant el perfil', 'error');
  }
};

// � Funció per actualitzar el perfil de l'usuari
const updateProfile = async (formData: FormData): Promise<boolean> => {
  try {
    // 🚫 Verificar si és compte de Google
    if (isGoogleAccount) {
      showToast('Els comptes de Google no es poden modificar', 'error');
      return false;
    }

    
    // Preparar les dades per enviar al backend
    const profileData = {
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      firstName: formData.get('name') as string,
      lastName: formData.get('lastname') as string,
      password: formData.get('password') as string || undefined // només si s'ha omplert
    };


    const response = await fetch(API_CONFIG.AUTH.UPDATE_PROFILE, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });

    if (response.ok) {
      const data = await response.json();
      showToast(i18n.t('editProfile.profileUpdated') || 'Perfil actualitzat amb èxit!', 'success');
      
      //  Recarregar les dades del perfil per mostrar els canvis
      await loadUserProfile();
      
      // 🧹 Netejar els camps de password
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      const currentPasswordInput = document.getElementById('currentPassword') as HTMLInputElement;
      if (passwordInput) passwordInput.value = '';
      if (currentPasswordInput) currentPasswordInput.value = '';
      
      return true;
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Error desconegut' }));
      console.error(' Error updating profile:', response.status, errorData);
      
      //  Mostrar error específic de validació Zod
      const errorMessage = errorData.error || 'Error actualitzant el perfil';
      showToast(errorMessage, 'error');
      return false;
    }
  } catch (error) {
    console.error(' Error updating profile:', error);
    showToast('Error de connexió actualitzant el perfil', 'error');
    return false;
  }
};

// �� Funcions per gestionar els modals de 2FA
const show2FASetupModal = async (): Promise<void> => {
  try {
    
    //  Tancar el modal d'edició de perfil primer
    closeEditProfileModal();
    
    //  Usar el sistema centralitzat d'autenticació
    await showTwoFactorSetup();
    
    //  Actualitzar l'estat després del setup exitós
    update2FAToggle(true);
    
  } catch (error) {
    console.error(' Error en setup de 2FA:', error);
  }
};

const show2FADisableModal = async (): Promise<void> => {
  try {
    
    //  Tancar el modal d'edició de perfil primer
    closeEditProfileModal();
    
    //  Usar el sistema centralitzat d'autenticació
    await showTwoFactorDisable();
    
    //  Actualitzar l'estat després de la desactivació exitosa
    update2FAToggle(false);
    
  } catch (error) {
    console.error(' Error en disable de 2FA:', error);
  }
};

//  Funció per actualitzar el switch visual
const update2FAToggle = (enabled: boolean): void => {
  is2FAEnabled = enabled;
  const track = document.getElementById('twoFASwitchTrack');
  const thumb = document.getElementById('twoFASwitchThumb');
  const label = document.getElementById('twoFASwitchLabel');
  
  if (enabled) {
    // Activat
    track?.classList.remove('bg-red-600/70');
    track?.classList.add('bg-teal-600');
    thumb?.classList.remove('translate-x-0.5');
    thumb?.classList.add('translate-x-6', 'sm:translate-x-7');
    if (label) {
      label.textContent = i18n.t('editProfile.twoFAEnabled') || 'Activado';
      label.classList.remove('text-red-400');
      label.classList.add('text-teal-300');
    }
  } else {
    // Desactivat
    track?.classList.remove('bg-teal-600');
    track?.classList.add('bg-red-600/70');
    thumb?.classList.remove('translate-x-6', 'sm:translate-x-7');
    thumb?.classList.add('translate-x-0.5');
    if (label) {
      label.textContent = i18n.t('editProfile.twoFADisabled') || 'Desactivado';
      label.classList.remove('text-teal-300');
      label.classList.add('text-red-400');
    }
  }
};

// 🔔 Funció per mostrar missatges utilitzant el sistema de toasts centralitzat
//  NUEVO: Función específica para limpiar event listeners
const cleanupModalEventListeners = (): void => {
  // Limpiar keydown handler global
  if (modalKeydownHandler) {
    document.removeEventListener('keydown', modalKeydownHandler);
    modalKeydownHandler = null;
  }
  
  // Ejecutar todos los callbacks de cleanup
  modalCleanupCallbacks.forEach(callback => callback());
  modalCleanupCallbacks = [];
};

export const showEditProfileModal = async (): Promise<void> => {
  //  LIMPIAR: Modal anterior si existe
  closeEditProfileModal();
  editProfileModalInitialized = false;

  //  Create modal container if doesn't exist
  let modalContainer = document.getElementById('modalContainer');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'modalContainer';
    modalContainer.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4';
    document.body.appendChild(modalContainer);
  } else {
    modalContainer.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4';
  }

  //  Render modal
  modalContainer.innerHTML = renderEditProfileModal();

  //  Initialize modal
  await initEditProfileModal();

  //  Prevent body scroll
  document.body.style.overflow = 'hidden';

  //  Focus management para accesibilidad
  const modal = document.getElementById('editProfileModal');
  if (modal) {
    modal.focus();
  }
};

export const closeEditProfileModal = (): void => {
  editProfileModalInitialized = false;
  //  LIMPIAR: Event listeners específicos del modal
  cleanupModalEventListeners();

  //  ELIMINAR: Modal container completamente del DOM
  const modalContainer = document.getElementById('modalContainer');
  if (modalContainer) {
    modalContainer.remove();
  }
  
  //  Restore body scroll
  document.body.style.overflow = '';
  
  //  LIMPIAR: Variables globales
  modalKeydownHandler = null;
  modalCleanupCallbacks = [];
  
};