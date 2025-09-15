/**
 * Mòdul d'utilitat per gestionar correctament l'autenticació OAuth2 amb IP dinàmica
 * 
 * Aquest mòdul permet:
 * 1. Detectar l'origen de les peticions (IP o localhost)
 * 2. Gestionar correctament les redireccions
 * 3. Suportar l'accés des de qualsevol dispositiu a la xarxa local
 */

// Funció per obtenir la URL de redirecció final
export function getFrontendUrl(req) {
  // Recupera la cookie d'origen original, si existeix
  const originalOrigin = req.cookies && req.cookies.original_origin;
  
  // Si la cookie existeix i no és localhost, l'utilitzem
  if (originalOrigin && originalOrigin !== 'localhost' && originalOrigin !== '127.0.0.1') {
    console.log(`🌐 Utilitzant origen original: ${originalOrigin}`);
    return `https://${originalOrigin}:3000`;
  }
  
  // Alternativament, utilitzem la URL configurada en l'entorn
  const configuredUrl = process.env.FRONTEND_URL || 'https://localhost:3000';
  console.log(`📝 Utilitzant URL configurada: ${configuredUrl}`);
  return configuredUrl;
}

// Funció per detectar l'origen de la petició
export function detectOrigin(req) {
  const host = req.headers.host || '';
  const hostname = host.split(':')[0]; // Eliminem el port si existeix
  
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isDockerInternal = ['api-gateway', 'auth-service', 'auth', 'api'].includes(hostname);
  const isIP = /^\d+\.\d+\.\d+\.\d+$/.test(hostname);
  
  return {
    hostname,
    isLocalhost,
    isDockerInternal,
    isIP,
    isRemoteAccess: isIP && !isLocalhost
  };
}

// Funció per guardar l'origen en una cookie
export function saveOriginForCallback(req, res) {
  const origin = detectOrigin(req);
  
  if (origin.isRemoteAccess || origin.isLocalhost) {
    res.cookie('original_origin', origin.hostname, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 300000 // 5 minuts
    });
    
    console.log(`💾 Origen guardat en cookie: ${origin.hostname}`);
    return true;
  }
  
  return false;
}
