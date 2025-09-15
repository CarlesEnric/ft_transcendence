// Utilitat per fer fetch només afegint el JWT a rutes protegides
// Usa-la als teus components en comptes de fetch directament

import { API_CONFIG } from '../config/api';

export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
  return fetch(input, { ...init, credentials: 'include' });
}

// Funció específica per fer logout
export async function logout(): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await apiFetch(API_CONFIG.AUTH.LOGOUT, {
      method: 'POST',
      // No enviem Content-Type ni body per evitar l'error de Fastify
      //headers: {
      //  'Content-Type': 'application/json',
      // },
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, message: data.message };
    } else {
      return { success: false, error: data.error || 'Logout failed' };
    }
  } catch (error) {
    return { success: false, error: 'Network error during logout' };
  }
}
