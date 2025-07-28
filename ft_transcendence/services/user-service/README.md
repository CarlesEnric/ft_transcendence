# User Service

*[English](#english) | [Català](#català)*

---

## English

**Responsibility:** User profile management

### Function
- User profiles
- Avatar management
- Friends system
- Online/offline status

### Endpoints
- GET `/profile` - Get user profile
- PUT `/profile` - Update profile
- POST `/avatar` - Upload avatar
- GET `/friends` - Friends list
- POST `/friends/:id` - Add friend

### Database
- SQLite: `users_profiles.db`
- Tables: profiles, friendships

### Technologies
- Fastify
- Multer (file upload)
- SQLite
- crypto (secure random generation for tokens)
- sharp (image processing for avatars)

---

## Català

**Responsabilitat:** Gestió de perfils d'usuari

### Funció
- Perfils d'usuari
- Gestió d'avatars
- Sistema d'amics
- Estat online/offline

### Endpoints
- GET `/profile` - Obtenir perfil usuari
- PUT `/profile` - Actualitzar perfil
- POST `/avatar` - Pujar avatar
- GET `/friends` - Llista d'amics
- POST `/friends/:id` - Afegir amic

### Base de dades
- SQLite: `users_profiles.db`
- Taules: profiles, friendships

### Tecnologies
- Fastify
- Multer (upload files)
- SQLite
- crypto (generació segura aleatòria per tokens)
- sharp (processament d'imatges per avatars)
