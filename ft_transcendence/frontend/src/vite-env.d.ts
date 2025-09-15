/// <reference types="vite/client" />

// Definició dels tipus per a les variables d'entorn
interface ImportMetaEnv {
  readonly VITE_HOST_IP: string
  readonly VITE_API_URL: string
  // Afegeix altres variables d'entorn si és necessari
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
