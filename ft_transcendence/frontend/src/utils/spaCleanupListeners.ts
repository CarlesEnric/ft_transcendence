// Utilitat per gestionar listeners SPA en vistes externes (Landing, Login, Register)
export function setupSpaCleanupListeners(cleanupFn: () => void, rerenderFn: () => void) {
  window.addEventListener('popstate', cleanupFn); // Fletxes navegador
  window.addEventListener('beforeunload', cleanupFn); // Tancar/recargar pàgina
  window.addEventListener('languageChanged', rerenderFn); // Canvi de llengua

  // Opcional: retorna una funció per eliminar listeners
  return () => {
    window.removeEventListener('popstate', cleanupFn);
    window.removeEventListener('beforeunload', cleanupFn);
    window.removeEventListener('languageChanged', rerenderFn);
  };
}
