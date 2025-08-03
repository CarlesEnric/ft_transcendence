# 👥 User Service - Gestió d'Usuaris i Perfils

## 📋 Visió General

El User Service és el **microservei responsable de la gestió de perfils d'usuari i sistema social** de ft_transcendence. Gestiona perfils, avatars, sistema d'amics, estat en línia i informació addicional dels usuaris més enllà de l'autenticació bàsica.

## 🏗️ Estat d'Implementació

### 🔨 **EN DESENVOLUPAMENT**
- **Servidor base**: Fastify amb SSL/HTTPS
- **JWT Integration**: Autenticació amb cookies
- **SQLite setup**: Base de dades preparada
- **Docker ready**: Containerització preparada

### 📋 **PER IMPLEMENTAR**
- **User Profiles**: Gestió perfils detallats
- **Avatar System**: Upload i gestió d'avatars
- **Friends System**: Afegir/eliminar amics
- **Online Status**: Estat en línia/offline
- **User Statistics**: Stats personalitzades

## 🔧 Tecnologies

- **Fastify**: Framework web d'alt rendiment
- **SQLite**: Base de dades lleugera per perfils
- **JWT**: Autenticació via cookies
- **Multer**: Upload d'avatars (planificat)
- **WebSockets**: Estat online real-time (planificat)
- **TypeScript**: Type safety complet

## 📁 Estructura del Codi (Planificada)

```
services/user-service/
├── src/
│   ├── index.ts             # Entry point del servei
│   ├── server.ts            # Configuració servidor
│   │
│   ├── database/
│   │   ├── schema.ts        # SQLite schemas
│   │   ├── users.ts         # User operations
│   │   └── friends.ts       # Friends operations
│   │
│   ├── routes/
│   │   ├── profiles.ts      # API gestió perfils
│   │   ├── friends.ts       # API sistema d'amics
│   │   ├── avatars.ts       # API upload avatars
│   │   └── health.ts        # Health checks
│   │
│   ├── controllers/
│   │   ├── userController.ts    # Lògica negoci usuaris
│   │   ├── friendsController.ts # Lògica amics
│   │   └── avatarController.ts  # Lògica avatars
│   │
│   ├── middleware/
│   │   ├── auth.ts          # JWT validation
│   │   ├── upload.ts        # Multer configuration
│   │   └── validation.ts    # Input validation
│   │
│   ├── types/
│   │   ├── user.types.ts    # User interfaces
│   │   └── friends.types.ts # Friends interfaces
│   │
│   └── utils/
│       ├── validation.ts    # Zod schemas
│       ├── fileUtils.ts     # Avatar file handling
│       └── notifications.ts # Friend notifications
│
├── uploads/                 # Avatar storage
├── ssl/                     # Certificats SSL
└── users.db                # SQLite database
```

## 🗃️ Schema de Base de Dades (Planificat)

```sql
-- Perfils d'usuari detallats
CREATE TABLE user_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,      -- FK a auth service user
  display_name TEXT,                    -- Nom per mostrar
  bio TEXT,                            -- Descripció personal
  avatar_url TEXT,                     -- URL avatar personalitzat
  country TEXT,                        -- País d'origen
  preferred_language TEXT DEFAULT 'en', -- Idioma preferit
  timezone TEXT,                       -- Zona horària
  is_online BOOLEAN DEFAULT 0,         -- Estat online
  last_seen DATETIME,                  -- Última connexió
  privacy_level TEXT DEFAULT 'public', -- public/friends/private
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sistema d'amics
CREATE TABLE friendships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requester_id INTEGER NOT NULL,       -- Qui envia la sol·licitud
  addressee_id INTEGER NOT NULL,       -- Qui rep la sol·licitud
  status TEXT NOT NULL,                -- pending/accepted/declined/blocked
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(requester_id, addressee_id)
);

-- Configuracions d'usuari
CREATE TABLE user_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  notifications_enabled BOOLEAN DEFAULT 1,
  email_notifications BOOLEAN DEFAULT 1,
  friend_requests_enabled BOOLEAN DEFAULT 1,
  show_online_status BOOLEAN DEFAULT 1,
  allow_game_invites BOOLEAN DEFAULT 1,
  theme_preference TEXT DEFAULT 'dark',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Històric d'estat online
CREATE TABLE user_activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  activity_type TEXT NOT NULL,         -- login/logout/game_start/game_end
  details TEXT,                        -- JSON amb detalls addicionals
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔌 API Endpoints (Planificats)

### **Gestió de Perfils**
```typescript
GET    /profiles/:userId        # Obtenir perfil usuari
PUT    /profiles/:userId        # Actualitzar perfil propi
DELETE /profiles/:userId        # Eliminar perfil (GDPR)
GET    /profiles/search?q=name  # Cercar usuaris
```

### **Sistema d'Avatars**
```typescript
POST   /avatars/upload          # Upload avatar personalitzat
GET    /avatars/:userId         # Obtenir avatar usuari
DELETE /avatars/:userId         # Eliminar avatar (tornar a default)
GET    /avatars/default         # Llista avatars per defecte
```

### **Sistema d'Amics**
```typescript
GET    /friends                 # Llista d'amics
POST   /friends/request         # Enviar sol·licitud amistat
PUT    /friends/accept/:id      # Acceptar sol·licitud
PUT    /friends/decline/:id     # Rebutjar sol·licitud
DELETE /friends/:userId         # Eliminar amic
GET    /friends/requests        # Sol·licituds pendents
POST   /friends/block/:userId   # Bloquejar usuari
```

### **Estat i Activitat**
```typescript
GET    /users/online            # Usuaris online
PUT    /users/status            # Actualitzar estat propi
GET    /users/:userId/status    # Estat específic usuari
GET    /users/activity/:userId  # Activitat recent usuari
```

## 👤 Funcionalitats Planificades

### **1. Perfils Detallats**
```typescript
interface UserProfile {
  userId: number;
  displayName: string;
  bio: string;
  avatarUrl: string;
  country: string;
  preferredLanguage: string;
  isOnline: boolean;
  lastSeen: Date;
  privacyLevel: 'public' | 'friends' | 'private';
  gameStats: {
    totalGames: number;
    wins: number;
    losses: number;
    winRate: number;
  };
}
```

### **2. Sistema d'Amics**
```typescript
interface Friendship {
  id: number;
  requester: UserProfile;
  addressee: UserProfile;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  createdAt: Date;
}

// Operacions amics
const sendFriendRequest = (toUserId: number) => Promise<Friendship>;
const acceptFriendRequest = (requestId: number) => Promise<void>;
const getFriends = (userId: number) => Promise<UserProfile[]>;
```

### **3. Avatar System**
```typescript
// Upload avatar personalitzat
POST /avatars/upload
Content-Type: multipart/form-data
{
  avatar: File  // Imatge (JPG, PNG, max 2MB)
}

// Avatars per defecte
const defaultAvatars = [
  'avatar_1.png', 'avatar_2.png', 'avatar_3.png',
  'avatar_robot.png', 'avatar_cat.png', 'avatar_space.png'
];
```

### **4. Online Status Real-time**
```typescript
// WebSocket events per estat online
socket.on('user-online', { userId, timestamp });
socket.on('user-offline', { userId, lastSeen });
socket.on('user-in-game', { userId, gameId });

// Privacy controls
const updateStatus = (status: 'online' | 'away' | 'busy' | 'invisible');
```

## 🔐 Privacitat i Seguretat

### **Privacy Levels**
```typescript
// public: Tothom pot veure perfil i estat
// friends: Només amics veuen informació detallada
// private: Minimal informació visible

const getVisibleProfile = (userId: number, viewerId: number) => {
  const profile = getUserProfile(userId);
  const relationship = getFriendshipStatus(userId, viewerId);
  
  return filterProfileByPrivacy(profile, relationship);
};
```

### **GDPR Compliance**
```typescript
// Dret a l'oblit
DELETE /profiles/:userId/gdpr-delete
{
  confirmPassword: string;
  reason: string;
}

// Exportar dades personals
GET /profiles/:userId/export
// → ZIP amb totes les dades de l'usuari
```

## ⚙️ Configuració Planificada

### **Variables d'Entorn**
```bash
# Server
USER_SERVICE_PORT=3002
HOST=0.0.0.0

# Database
USER_DB_PATH=./users.db

# File Upload
UPLOAD_PATH=./uploads/avatars/
MAX_AVATAR_SIZE=2097152  # 2MB
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif

# Privacy
DEFAULT_PRIVACY_LEVEL=public
FRIEND_REQUEST_COOLDOWN=3600  # 1 hora

# SSL
SSL_CERT_PATH=./ssl/cert.pem
SSL_KEY_PATH=./ssl/key.pem
```

## 🔄 Integració amb Altres Serveis

### **Auth Service Sync**
```typescript
// Sincronitzar usuaris del auth service
POST /internal/sync-user
{
  userId: number;
  username: string;
  email: string;
  createdAt: Date;
}
```

### **Match Service Integration**
```typescript
// Obtenir stats de partides per perfil
const enrichProfileWithStats = async (profile) => {
  const stats = await fetch(`/api/matches/stats/${profile.userId}`);
  return { ...profile, gameStats: stats };
};
```

## 📈 Funcionalitats Futures

- **Achievements System**: Logros i badges
- **User Groups**: Grups i clans
- **Event Calendar**: Esdeveniments i tornejos
- **Social Feed**: Timeline d'activitat d'amics
- **Voice Chat**: Integració comunicació de veu

## 🚀 Execució

```bash
# Desenvolupament
npm run dev

# Build i start
npm run build
npm start

# Docker
docker build -t user-service .
docker run -p 3002:3002 user-service
```

---

**📡 Port intern**: 3002 (només accessible via API Gateway)  
**👥 Responsabilitat**: Perfils, amics i informació social dels usuaris
