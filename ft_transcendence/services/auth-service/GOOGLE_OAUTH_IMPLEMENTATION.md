# 🚀 Google OAuth Implementation Guide

## Què s'ha implementat

### ✅ **Endpoints disponibles:**
- `GET /auth/google` - Inicia el flux OAuth2 (redirigeix a Google)
- `GET /auth/google/callback` - Callback per processar la resposta de Google
- `GET /auth/profile` - Obté el perfil de l'usuari autenticat (requereix JWT)

### ✅ **Funcionalitats:**
1. **OAuth2 Flow complet** amb Google
2. **Creació automàtica d'usuaris** nous
3. **Linking d'usuaris existents** amb comptes de Google
4. **Generació de JWT tokens** després de l'autenticació
5. **Gestió d'avatars** des de Google
6. **Redireccions segures** al frontend

### ✅ **Base de dades:**
- Suport per `google_id` a la taula `users`
- Taula `oauth_users` per informació addicional de Google
- Verificació automàtica per usuaris OAuth (`is_verified = true`)

## Com usar-ho

### 1. **Configurar Google Cloud Console:**
Segueix la guia a `GOOGLE_OAUTH_SETUP.md`

### 2. **Variables d'entorn:**
```bash
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-client-secret
GOOGLE_REDIRECT_URI=https://localhost:3000/auth/google/callback
FRONTEND_URL=https://localhost:5173
```

### 3. **Frontend Integration:**
```javascript
// Redirigir a Google OAuth
window.location.href = 'https://localhost:3000/auth/google';

// Processar token després del callback
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
if (token) {
  localStorage.setItem('jwt_token', token);
  // Redirigir a dashboard o home
}
```

### 4. **Testing amb curl:**
```bash
# Obrir Google OAuth (redirigirà al navegador)
curl -L "https://localhost:3000/auth/google"

# Verificar perfil (amb token JWT)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     "https://localhost:3000/auth/profile"
```

## Flux d'autenticació

1. **Usuari clica "Login with Google"**
2. **Frontend redirigeix** a `/auth/google`
3. **Auth service redirigeix** a Google OAuth
4. **Google autentica** l'usuari
5. **Google redirigeix** a `/auth/google/callback`
6. **Auth service processa** la resposta:
   - Obté informació de l'usuari de Google
   - Crea nou usuari o enllaça usuari existent
   - Genera JWT token
7. **Redirigeix al frontend** amb el token
8. **Frontend guarda** el token i autentica l'usuari

## Seguretat

✅ **HTTPS requerit** per producció
✅ **Tokens JWT** amb expiració
✅ **Validació de scopes** de Google
✅ **Prevenció de CSRF** amb state parameter
✅ **Sanitització** de dades d'usuari

## Següents passos

El proper punt seria implementar **2FA (Two-Factor Authentication)** per complir els requisits majors restants.
