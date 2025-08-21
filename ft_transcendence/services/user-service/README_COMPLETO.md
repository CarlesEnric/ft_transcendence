# 👥 User Service - Gestió d'Usuaris

## 📋 Visió General

El User Service gestiona **perfils d'usuari, sistema d'amics i estat online/offline**. Està preparat com a placeholder amb estructura completa per desenvolupament.

## 🏗️ Funcionalitats Planificades

### ⚠️ **PLACEHOLDER - READY FOR DEVELOPMENT**
- Gestió de perfils d'usuari extesos
- Sistema d'amics simple
- Estat online/offline tracking  
- Actualització d'avatars
- Cerca d'usuaris
- Configuració de privacitat

## 🔧 Tecnologies

- **Fastify**: Framework web amb SSL/HTTPS
- **SQLite**: Base de dades per perfils i relacions
- **JWT Validation**: Verificació tokens via Auth Service
- **TypeScript**: Type safety complet

## 📁 Estructura Actual

```
services/user-service/
├── src/
│   └── index.ts            # Entry point placeholder
├── ssl/
│   ├── ssl.sh             # Script generació certificats
│   ├── cert.pem           # Certificat SSL
│   └── key.pem            # Clau privada SSL
├── Dockerfile             # Container configuration
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```

## 🚀 API Endpoints Plannificats

### **User Management**
```typescript
GET    /profile/:userId        # Perfil públic d'usuari
PUT    /profile               # Actualitzar perfil propi
POST   /avatar                # Upload avatar
DELETE /avatar                # Eliminar avatar
```

### **Friends System**
```typescript
GET    /friends               # Llista d'amics
POST   /friends/:userId       # Enviar petició d'amistat
PUT    /friends/:userId       # Acceptar petició
DELETE /friends/:userId       # Eliminar amic o rebutjar
GET    /friends/requests      # Peticions pendents
```

### **Search & Discovery**
```typescript
GET    /search?q=username     # Cerca usuaris
GET    /online                # Usuaris online
GET    /leaderboard          # Top usuaris (puntuació)
```

## 🗄️ Database Schema Planificat

```sql
-- Extended user profiles
CREATE TABLE user_profiles (
  user_id INTEGER PRIMARY KEY,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  location TEXT,
  website TEXT,
  is_public BOOLEAN DEFAULT 1,
  last_seen DATETIME,
  online_status TEXT DEFAULT 'offline', -- 'online', 'offline', 'away'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Friends relationships
CREATE TABLE friendships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requester_id INTEGER NOT NULL,
  addressee_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  accepted_at DATETIME,
  UNIQUE(requester_id, addressee_id)
);

-- User preferences
CREATE TABLE user_preferences (
  user_id INTEGER PRIMARY KEY,
  theme TEXT DEFAULT 'dark',
  language TEXT DEFAULT 'en',
  notifications_enabled BOOLEAN DEFAULT 1,
  public_profile BOOLEAN DEFAULT 1,
  show_online_status BOOLEAN DEFAULT 1
);
```

## 🔧 Implementació Prevista

### **1. User Profile Management**
```typescript
// GET /profile/:userId
server.get('/profile/:userId', async (request, reply) => {
  const { userId } = request.params;
  
  // Get user profile from database
  const profile = await getUserProfile(db, userId);
  
  if (!profile) {
    return reply.code(404).send({ error: 'User not found' });
  }
  
  // Check privacy settings
  if (!profile.is_public) {
    // Only show to friends or self
    const requesterId = getRequesterUserId(request);
    const isFriend = await checkFriendship(db, requesterId, userId);
    
    if (requesterId !== userId && !isFriend) {
      return reply.code(403).send({ error: 'Profile is private' });
    }
  }
  
  return reply.send({
    success: true,
    profile: formatUserProfile(profile)
  });
});

// PUT /profile
server.put('/profile', async (request, reply) => {
  const userId = getUserIdFromToken(request);
  const updates = validateProfileUpdates(request.body);
  
  const updatedProfile = await updateUserProfile(db, userId, updates);
  
  return reply.send({
    success: true,
    profile: formatUserProfile(updatedProfile)
  });
});
```

### **2. Friends System**
```typescript
// POST /friends/:userId - Send friend request
server.post('/friends/:userId', async (request, reply) => {
  const requesterId = getUserIdFromToken(request);
  const { userId: addresseeId } = request.params;
  
  if (requesterId === addresseeId) {
    return reply.code(400).send({ error: 'Cannot add yourself as friend' });
  }
  
  // Check if already friends or pending
  const existingRelation = await getFriendship(db, requesterId, addresseeId);
  if (existingRelation) {
    return reply.code(409).send({ error: 'Friendship already exists' });
  }
  
  // Create friend request
  await createFriendRequest(db, requesterId, addresseeId);
  
  // TODO: Send notification to addressee
  
  return reply.code(201).send({
    success: true,
    message: 'Friend request sent'
  });
});

// PUT /friends/:userId - Accept friend request
server.put('/friends/:userId', async (request, reply) => {
  const addresseeId = getUserIdFromToken(request);
  const { userId: requesterId } = request.params;
  
  // Find pending request
  const request = await getFriendRequest(db, requesterId, addresseeId);
  if (!request || request.status !== 'pending') {
    return reply.code(404).send({ error: 'No pending friend request found' });
  }
  
  // Accept the request
  await acceptFriendRequest(db, requesterId, addresseeId);
  
  return reply.send({
    success: true,
    message: 'Friend request accepted'
  });
});

// GET /friends - List friends
server.get('/friends', async (request, reply) => {
  const userId = getUserIdFromToken(request);
  
  const friends = await getFriendsList(db, userId);
  
  return reply.send({
    success: true,
    friends: friends.map(formatFriend)
  });
});
```

### **3. Online Status Tracking**
```typescript
// Middleware per tracking online status
server.addHook('onRequest', async (request) => {
  const userId = getUserIdFromToken(request);
  if (userId) {
    // Update last seen timestamp
    await updateLastSeen(db, userId);
  }
});

// WebSocket connection per real-time status
server.register(async (fastify) => {
  fastify.get('/ws/status', { websocket: true }, (connection, request) => {
    const userId = getUserIdFromToken(request);
    
    // Mark user as online
    updateOnlineStatus(db, userId, 'online');
    
    connection.on('close', () => {
      // Mark user as offline after connection closes
      updateOnlineStatus(db, userId, 'offline');
    });
    
    // Heartbeat per mantenir connexió
    const heartbeat = setInterval(() => {
      connection.ping();
    }, 30000);
    
    connection.on('close', () => {
      clearInterval(heartbeat);
    });
  });
});
```

### **4. Search & Discovery**
```typescript
// GET /search?q=username
server.get('/search', async (request, reply) => {
  const { q: query } = request.query;
  const searcherId = getUserIdFromToken(request);
  
  if (!query || query.length < 3) {
    return reply.code(400).send({ error: 'Query must be at least 3 characters' });
  }
  
  const results = await searchUsers(db, query, searcherId);
  
  return reply.send({
    success: true,
    results: results.map(formatSearchResult)
  });
});

// GET /online
server.get('/online', async (request, reply) => {
  const userId = getUserIdFromToken(request);
  
  // Get online friends
  const onlineFriends = await getOnlineFriends(db, userId);
  
  return reply.send({
    success: true,
    online_friends: onlineFriends.map(formatOnlineUser)
  });
});
```

## ⚙️ Configuration Prevista

### **Environment Variables**
```bash
# User Service Configuration
NODE_ENV=development
PORT=3002

# Database
DATABASE_PATH=/app/database/user.db

# Auth Service Integration
AUTH_SERVICE_URL=https://auth-service:3001

# File Upload (Avatars)
UPLOAD_MAX_SIZE=5MB
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/webp
AVATAR_STORAGE_PATH=/app/uploads/avatars

# Features
ENABLE_FRIEND_SYSTEM=true
ENABLE_ONLINE_STATUS=true
MAX_FRIENDS_PER_USER=100
```

## 🐳 Docker Configuration

### **Dockerfile Actual**
```dockerfile
FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/
COPY tsconfig.json ./

# Generate SSL certificates
RUN mkdir -p ssl database uploads/avatars
COPY ssl/ssl.sh ./ssl/
RUN chmod +x ./ssl/ssl.sh && ./ssl/ssl.sh

RUN npm run build

EXPOSE 3002
CMD ["npm", "start"]
```

## 📊 Estat Actual

### ✅ **Implementat**
- Estructura basic del servei
- SSL/HTTPS configuration
- Health check endpoint
- Docker configuration
- TypeScript setup

### ⚠️ **PLACEHOLDER NOMÉS**
- Database schema
- User profile management
- Friends system
- Online status tracking
- Search functionality
- Avatar upload system

### ❌ **Pendent Desenvolupament**
- Implementar totes les funcionalitats planificades
- Integració amb Auth Service per JWT validation
- WebSocket per real-time status
- File upload per avatars
- Notificacions per friend requests

## 🎯 Pròxims Passos de Desenvolupament

### **Fase 1: Core User Management**
1. Implementar user profile endpoints
2. Database schema creation i migration
3. JWT validation middleware
4. Basic profile CRUD operations

### **Fase 2: Friends System**
1. Friend request system
2. Accept/reject functionality
3. Friends list management
4. Privacy controls

### **Fase 3: Advanced Features**
1. Online status tracking
2. User search functionality
3. Avatar upload system
4. Real-time notifications

### **Fase 4: Integration**
1. Integration amb Game Service per stats
2. Integration amb Match Service per history
3. Real-time WebSocket connections
4. Advanced privacy settings

## 📝 Notes de Desenvolupament

- **Port 3002**: Internal Docker network
- **Database**: SQLite per simplicitat, escalable a PostgreSQL
- **JWT Integration**: Validació via Auth Service
- **Real-time**: WebSocket per online status i notifications
- **File Upload**: Local storage amb plans per cloud storage
- **Privacy**: User-controlled privacy settings
- **Scalability**: Prepared per horizontal scaling

## 🔗 Integracions Previstes

### **Auth Service**
- JWT token validation
- User existence verification
- Profile synchronization

### **Game Service**
- Player stats integration
- Game invitations entre amics
- Tournament creation

### **Match Service**
- Match history sharing
- Stats comparison entre amics
- Leaderboard integration

### **Frontend**
- Real-time friend status updates
- Friend management UI
- Profile customization interface

**El User Service està PREPARAT per desenvolupament amb arquitectura sòlida i plans detallats.**
