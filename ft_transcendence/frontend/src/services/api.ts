// Utilitat per fer fetch només afegint el JWT a rutes protegides
// Usa-la als teus components en comptes de fetch directament

export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
  return fetch(input, { ...init, credentials: 'include' });
}
