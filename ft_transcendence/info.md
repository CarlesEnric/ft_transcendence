### Característiques principals del projecte:

1. **Joc de Pong en temps real** - El nucli del projecte
2. **Arquitectura de microserveis** - Backend dividit en serveis independents
3. **Multijugador remot** - Jugadors poden jugar des de diferents ordinadors
4. **Autenticació avançada** - Inclou Google Sign-in, 2FA i JWT
5. **Gestió d'usuaris completa** - Perfils, amics, estadístiques, historial
6. **Gràfics 3D avançats** - Utilitzant Babylon.js
7. **Compliment GDPR** - Gestió de dades i privacitat

### Tecnologies utilitzades:

- **Backend**: Fastify amb Node.js i TypeScript
- **Frontend**: React/TypeScript amb Tailwind CSS
- **Base de dades**: SQLite
- **Gràfics**: Babylon.js per als efectes 3D
- **Arquitectura**: Microserveis amb API Gateway
- **Contenidors**: Docker amb docker-compose

### Estructura de microserveis:

L'arquitectura actual inclou:
- **API Gateway** (que estàs editant ara)
- **Auth Service** (autenticació)
- **User Service** (gestió d'usuaris)
- **Game Service** (lògica del joc)
- **Match Service** (partides i historial)

El fitxer que estàs veient (`utils/index.ts`) forma part de l'API Gateway, que actua com a punt d'entrada principal per gestionar les peticions cap als diferents microserveis i servir el frontend SPA.

CarlesEnric: bé tinc entès que els websockets els puc gestionar des de l'api gateway com a mesura de seguretat, em pots ajudar a fer-ho? abans que crear els arxius informa'm abans del que vols fer perque pugi entendre i decidir per a on proseguir

GitHub Copilot: Perfecte! Tens raó, gestionar els WebSockets des de l'API Gateway és una excel·lent pràctica de seguretat. Deixa'm analitzar primer l'estructura actual i després t'explico la meva proposta abans de fer canvis. Ara tinc una visió clara de l'estructura actual. Deixa'm explicar-te la meva proposta per gestionar els WebSockets des de l'API Gateway:

## **Proposta per a la Gestió de WebSockets**

### **Situació actual:**
- Ja tens una estructura bàsica de WebSockets a websocket.ts
- Hi ha endpoints per `/ws/game` i `/ws/notifications`
- Però ara mateix només fan log i tenen TODOs

### **El que proposo fer:**

#### **1. Millores a la Seguretat WebSocket:**
- **Autenticació WebSocket**: Validar JWT tokens abans d'acceptar connexions
- **Autorització per sala**: Verificar que l'usuari pot accedir a la sala/joc específic
- **Rate limiting**: Limitar missatges per connexió
- **Validació de missatges**: Esquemes per validar els missatges entrants

#### **2. Gestió de Connexions:**
- **Connection Manager**: Una classe per gestionar totes les connexions actives
- **Room Management**: Agrupar connexions per sales/jocs
- **User Sessions**: Mapejar usuaris amb les seves connexions
- **Cleanup automàtic**: Netejar connexions mortes

#### **3. Proxy WebSocket cap als Microserveis:**
- **Forwarding intel·ligent**: Enviar missatges als serveis correctes segons el tipus
- **Load balancing**: Distribuir connexions entre instàncies dels serveis
- **Circuit breaker**: Gestionar errors dels serveis backend

#### **4. Funcionalitats del Joc:**
- **Game matching**: Emparejar jugadors per partides
- **Real-time game state**: Sincronitzar estat del joc entre jugadors
- **Spectator mode**: Permetre observadors a les partides
- **Reconnection**: Gestionar reconnexions dels jugadors

#### **5. Sistema de Notificacions:**
- **Push notifications**: Enviar notificacions en temps real
- **User presence**: Estat online/offline dels usuaris
- **Friend notifications**: Notificacions d'amics, invitacions, etc.

### **Estructura de fitxers que crearia:**

```
src/websocket/
├── connection-manager.ts    # Gestió de connexions
├── auth-middleware.ts       # Autenticació WebSocket
├── message-validator.ts     # Validació de missatges
├── room-manager.ts          # Gestió de sales
├── game-handler.ts          # Lògica específica del joc
└── types.ts                # Tipus específics per WebSocket
```

### **Preguntes per decidir la direcció:**

1. **Prioritat**: Què vols implementar primer? Autenticació, gestió de jocs, o notificacions?

2. **Autenticació**: Vols usar JWT tokens també per WebSockets o un sistema diferent?

3. **Persistència**: Vols que les connexions puguin reconnectar-se automàticament?

4. **Escalabilitat**: Planifiques tenir múltiples instàncies de l'API Gateway?

5. **Jocs**: Quin tipus de sincronització necessites? Estat complet o només events?

**Què et sembla aquesta proposta? Per on vols que comenci?**

CarlesEnric: voldria començar per autenticació per jwt, però abans que crear res, hauries de informar-me què implica la seva aplicació. De la mateixa manera a on es realizaria si dins de api gateway o del microservei de auth-service i com es realitza cada acció i perquè és tan necessari i important

GitHub Copilot: Perfecte! Deixa'm explicar-te tots els detalls sobre l'autenticació JWT per WebSockets abans de crear res. Ara tinc una visió clara de l'estructura actual. Deixa'm explicar-te **tot el que implica la implementació de JWT per WebSockets**:

## **🔐 Autenticació JWT per WebSockets: Anàlisi Complet**

### **1. PER QUÈ ÉS TAN IMPORTANT?**

#### **Problemes sense autenticació:**
- **Connexions anònimes**: Qualsevol pot connectar-se als WebSockets
- **Suplantació d'identitat**: Un usuari pot fer-se passar per un altre
- **Accés no autoritzat**: Accés a dades de partides d'altres usuaris
- **Spam i abuse**: Connexions malicioses poden saturar el sistema
- **Inconsistència de dades**: Usuaris no autenticats poden corromper l'estat del joc

#### **Beneficis de JWT per WebSockets:**
- **Verificació d'identitat**: Saber qui és cada usuari connectat
- **Autorització granular**: Controlar què pot fer cada usuari
- **Sessió persistent**: Mantenir contexte d'usuari durant la connexió
- **Seguretat**: Evitar atacants i connexions malicioses
- **Auditoria**: Registrar accions per usuari específic

### **2. ON ES REALITZA: API GATEWAY vs AUTH-SERVICE**

#### **🎯 RESPOSTA: API GATEWAY (amb verificació cap a Auth-Service)**

**Per què a l'API Gateway?**
- **Punt d'entrada únic**: Tots els WebSockets passen per aquí
- **Seguretat perimetral**: Bloquejar connexions no autoritzades abans d'arribar als serveis
- **Eficiència**: Evitar sobrecàrrega dels microserveis amb validacions repetides
- **Centralització**: Una sola implementació per a tots els tipus de WebSocket

**Rol de l'Auth-Service:**
- **Validació de tokens**: Verificar si el JWT és vàlid
- **Informació d'usuari**: Retornar dades de l'usuari autenticat
- **Renovació de tokens**: Gestionar refresh tokens si cal

### **3. COM ES REALITZA: FLUX DETALLAT**

#### **Flux d'Autenticació:**

```
1. CLIENT → API GATEWAY
   - Connexió WebSocket amb JWT al header/query
   - Exemple: ws://localhost:443/ws/game?token=eyJhbGciOiJIUzI1NiIs...

2. API GATEWAY → AUTH-SERVICE
   - Validació del token JWT
   - POST /api/auth/validate-token

3. AUTH-SERVICE → API GATEWAY
   - Resposta amb dades d'usuari o error
   - { valid: true, user: { id: 1, username: "player1" } }

4. API GATEWAY
   - Si vàlid: Establir connexió i guardar context d'usuari
   - Si invàlid: Rebutjar connexió amb error 401

5. DURANT LA CONNEXIÓ
   - Cada missatge porta context d'usuari
   - Verificacions d'autorització per sala/joc
   - Logging per auditoria
```

### **4. IMPLEMENTACIÓ TÈCNICA**

#### **A. Middleware d'Autenticació (API Gateway)**
```typescript
// Pseudocodi del que faria:
async function authenticateWebSocket(request: WebSocketRequest) {
  // 1. Extreure token del header/query
  const token = extractToken(request);
  
  // 2. Validar amb Auth-Service
  const userInfo = await validateWithAuthService(token);
  
  // 3. Retornar context d'usuari
  return userInfo;
}
```

#### **B. Gestió de Sessions**
```typescript
// Pseudocodi:
class WebSocketManager {
  private connections = new Map<string, ConnectionInfo>();
  
  addConnection(userId: string, connection: WebSocketConnection) {
    // Associar usuari amb connexió
  }
  
  getUserConnections(userId: string) {
    // Obtenir connexions d'un usuari
  }
}
```

#### **C. Verificació per Missatge**
```typescript
// Pseudocodi:
function handleMessage(connection: WebSocketConnection, message: any) {
  const user = connection.user; // Context d'usuari
  
  // Verificar autorització segons el tipus de missatge
  if (message.type === 'join_game') {
    if (!canJoinGame(user.id, message.gameId)) {
      connection.send({ error: 'Unauthorized' });
      return;
    }
  }
}
```

### **5. CONSIDERACIONS DE SEGURETAT**

#### **Vectors d'atac que prevenim:**
- **Token replay**: Tokens robats no serveixen sense context
- **Session hijacking**: Cada connexió té el seu propi context
- **Privilege escalation**: Verificacions granulars per acció
- **DoS attacks**: Rate limiting per usuari autenticat

#### **Vulnerabilitats a considerar:**
- **Token expiration**: Gestionar tokens caducats
- **Concurrent sessions**: Limitar connexions simultànies
- **Token refresh**: Renovar tokens durant connexions llargues

### **6. IMPACTE EN RENDIMENT**

#### **Overhead afegit:**
- **Validació inicial**: ~10-50ms per connexió (acceptable)
- **Memòria**: Context d'usuari per connexió (~1KB)
- **Xarxa**: Petició extra a Auth-Service per connexió

#### **Optimitzacions:**
- **Cache de tokens**: Evitar validacions repetides
- **Connection pooling**: Reutilitzar connexions HTTP
- **Batch validation**: Validar múltiples tokens junts

### **7. PLAN D'IMPLEMENTACIÓ**

#### **Ordre recomanat:**
1. **Middleware d'autenticació** (interceptar connexions)
2. **Integració amb Auth-Service** (validar tokens)
3. **Gestió de sessions** (mapejar usuaris-connexions)
4. **Autorització per missatge** (verificar permisos)
5. **Gestió d'errors** (timeout, tokens invàlids)
6. **Optimitzacions** (cache, pooling)

### **❓ PREGUNTES ABANS DE CONTINUAR:**

1. **Format del token**: Vols passar el JWT com a query parameter (`?token=...`) o header (`Authorization: Bearer ...`)?

2. **Gestió d'errors**: Com vols gestionar tokens caducats? Tancar connexió o demanar renovació?

3. **Múltiples connexions**: Un usuari pot tenir múltiples connexions WebSocket simultànies?

4. **Cache**: Vols implementar cache per tokens validats per millorar rendiment?

5. **Logging**: Quin nivell de logging vols per auditoria?

**Què et sembla aquesta anàlisi? Vols que comenci amb algun punt específic?**

CarlesEnric: voldria que em detallessis més els 5 punts de les preguntes abans de continuar, per tal de saber més per poder escollir la que més m'interessa entre pros i contres de les opcions donades

GitHub Copilot: Perfecte! Deixa'm detallar-te cada punt amb pros i contres per que puguis prendre la millor decisió:

## **🔍 ANÀLISI DETALLAT DE LES 5 PREGUNTES**

### **1. 🎫 FORMAT DEL TOKEN**

#### **OPCIÓ A: Query Parameter (`?token=...`)**
```typescript
// Exemple: ws://localhost:443/ws/game?token=eyJhbGciOiJIUzI1NiIs...
const token = request.url.split('token=')[1];
```

**✅ PROS:**
- **Implementació simple**: Fàcil d'extreure del URL
- **Compatibilitat**: Funciona amb tots els clients WebSocket
- **Debugging**: Visible als logs per debugging (amb cura)
- **Frontend simple**: `new WebSocket('ws://host/ws/game?token=' + token)`

**❌ CONTRES:**
- **Seguretat**: Token visible als logs del servidor/proxy
- **URL limits**: URLs molt llargues (tokens JWT són grans)
- **Caching**: Proxies poden cachejar URLs amb tokens
- **Referrer leakage**: Token pot aparèixer en referrer headers

#### **OPCIÓ B: Authorization Header (`Authorization: Bearer ...`)**
```typescript
// Exemple: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
const token = request.headers.authorization?.replace('Bearer ', '');
```

**✅ PROS:**
- **Seguretat**: Headers menys probables als logs
- **Estàndard**: Segueix l'estàndard OAuth/JWT
- **Proxy-friendly**: Proxies no cachegen headers d'autorització
- **Neteja**: URLs més nets

**❌ CONTRES:**
- **Complexitat**: Alguns clients WebSocket no suporten headers custom
- **Browser limitations**: JavaScript WebSocket API no permet headers custom
- **Debugging**: Més difícil de veure en debugs ràpids

#### **OPCIÓ C: Subprotocol (Híbrid)**
```typescript
// Exemple: new WebSocket('ws://host/ws/game', ['jwt', token])
const token = request.headers['sec-websocket-protocol'];
```

**✅ PROS:**
- **Seguretat**: Token no visible als logs de URL
- **Compatibilitat**: Funciona amb JavaScript WebSocket
- **Creativitat**: Ús innovador del protocol WebSocket

**❌ CONTRES:**
- **No estàndard**: Ús no convencional del subprotocol
- **Confusió**: Desenvolupadors poden no entendre'l
- **Limitacions**: Alguns proxies poden filtrar subprotocols

**🎯 RECOMANACIÓ**: **Query Parameter** per simplicitat inicial, migration a headers més endavant.

---

### **2. 🚨 GESTIÓ D'ERRORS DE TOKEN**

#### **OPCIÓ A: Tancar Connexió Immediatament**
```typescript
if (!validToken) {
  connection.close(4001, 'Unauthorized: Invalid token');
  return;
}
```

**✅ PROS:**
- **Seguretat**: Talla connexions no autoritzades ràpidament
- **Recursos**: Allibera connexions immediatament
- **Simplicitat**: Lògica clara i simple
- **Prevenció**: Evita que atacants mantinguin connexions

**❌ CONTRES:**
- **UX**: Usuaris amb tokens caducats perden connexió sobtadament
- **Reconnexions**: Força reconnexions constants
- **Latència**: Temps perdut en establir noves connexions

#### **OPCIÓ B: Demanar Renovació de Token**
```typescript
if (tokenExpired) {
  connection.send({
    type: 'token_expired',
    message: 'Please provide a new token'
  });
  // Mantenir connexió 30 segons per renovació
}
```

**✅ PROS:**
- **UX**: Connexió fluida sense interrupcions
- **Eficiència**: Evita reconnexions costoses
- **Flexibilitat**: Permet refresh tokens
- **Persistència**: Mantenen estat de joc/notificacions

**❌ CONTRES:**
- **Complexitat**: Lògica més complexa
- **Seguretat**: Connexions no autoritzades es mantenen temporalment
- **Recursos**: Consum de memòria per connexions "zombi"
- **Atacants**: Poden aprofitar el temps de gràcia

#### **OPCIÓ C: Degradació Gradual**
```typescript
if (tokenExpired) {
  connection.readOnly = true; // Només lectura
  connection.send({ type: 'token_expired', actions: ['read-only'] });
}
```

**✅ PROS:**
- **UX**: Usuari no perd informació
- **Seguretat**: Funcionalitat limitada
- **Graceful**: Degradació elegant
- **Informació**: Usuari pot veure què passa

**❌ CONTRES:**
- **Complexitat**: Més complex d'implementar
- **Confusió**: Usuaris poden no entendre l'estat
- **Seguretat**: Encara permeten alguna activitat

**🎯 RECOMANACIÓ**: **Opció A** per simplicitat inicial, **Opció B** per UX avançada.

---

### **3. 🔄 MÚLTIPLES CONNEXIONS SIMULTÀNIES**

#### **OPCIÓ A: Una Connexió Per Usuari**
```typescript
const userConnections = new Map<string, WebSocketConnection>();
if (userConnections.has(userId)) {
  // Tancar connexió anterior
  userConnections.get(userId).close();
}
userConnections.set(userId, newConnection);
```

**✅ PROS:**
- **Simplicitat**: Gestió fàcil d'usuaris
- **Recursos**: Menys consum de memòria/CPU
- **Consistència**: Estat únic per usuari
- **Debugging**: Més fàcil debuggar

**❌ CONTRES:**
- **Limitació**: Usuari no pot tenir múltiples tabs/dispositius
- **UX**: Tancar un tab tanca tot
- **Flexibilitat**: Menys opcions d'ús

#### **OPCIÓ B: Múltiples Connexions Permeses**
```typescript
const userConnections = new Map<string, Set<WebSocketConnection>>();
if (!userConnections.has(userId)) {
  userConnections.set(userId, new Set());
}
userConnections.get(userId).add(newConnection);
```

**✅ PROS:**
- **Flexibilitat**: Múltiples tabs/dispositius
- **UX**: Millor experiència d'usuari
- **Robustesa**: Backup si una connexió falla
- **Multi-device**: Suport per mobil + desktop

**❌ CONTRES:**
- **Complexitat**: Gestió més complexa
- **Recursos**: Més consum per usuari
- **Sincronització**: Mantenir estat consistent entre connexions
- **Seguretat**: Més vectors d'atac

#### **OPCIÓ C: Límit de Connexions**
```typescript
const MAX_CONNECTIONS_PER_USER = 3;
const userConnections = new Map<string, Set<WebSocketConnection>>();

if (userConnections.get(userId)?.size >= MAX_CONNECTIONS_PER_USER) {
  // Tancar connexió més antiga
  const oldestConnection = getOldestConnection(userId);
  oldestConnection.close();
}
```

**✅ PROS:**
- **Equilibri**: Flexibilitat amb control
- **Recursos**: Límit de consum per usuari
- **Seguretat**: Prevé atacs de connexions massives
- **Pràctic**: Cobreix casos d'ús reals

**❌ CONTRES:**
- **Complexitat**: Tracking d'edat de connexions
- **Arbitrari**: Límit pot ser insuficient/excessiu
- **Gestió**: Decidir quina connexió tancar

**🎯 RECOMANACIÓ**: **Opció C** amb límit de 2-3 connexions per usuari.

---

### **4. 💾 CACHE DE TOKENS**

#### **OPCIÓ A: Sense Cache**
```typescript
async function validateToken(token: string) {
  // Sempre validar amb Auth-Service
  return await authService.validateToken(token);
}
```

**✅ PROS:**
- **Seguretat**: Validació sempre actualitzada
- **Simplicitat**: Menys codi per mantenir
- **Consistència**: Sempre dades fresques
- **Debugging**: Menys punts de fallada

**❌ CONTRES:**
- **Latència**: Petició per cada validació
- **Carga**: Sobrecàrrega de l'Auth-Service
- **Disponibilitat**: Dependent de l'Auth-Service
- **Rendiment**: Més lent per connexions múltiples

#### **OPCIÓ B: Cache In-Memory**
```typescript
const tokenCache = new Map<string, {
  user: UserInfo,
  expiresAt: number
}>();

async function validateToken(token: string) {
  const cached = tokenCache.get(token);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.user;
  }
  // Validar i cachear
  const user = await authService.validateToken(token);
  tokenCache.set(token, { user, expiresAt: Date.now() + 5000 });
  return user;
}
```

**✅ PROS:**
- **Rendiment**: Validacions instantànies
- **Eficiència**: Menys càrrega a Auth-Service
- **Disponibilitat**: Funciona si Auth-Service falla temporalment
- **Latència**: Connexions més ràpides

**❌ CONTRES:**
- **Seguretat**: Tokens revocats poden seguir sent vàlids
- **Memòria**: Consum de memòria creixent
- **Consistència**: Dades poden estar obsoletes
- **TTL**: Gestió d'expiració complexa

#### **OPCIÓ C: Cache Distribuït (Redis)**
```typescript
const redis = new Redis(process.env.REDIS_URL);

async function validateToken(token: string) {
  const cached = await redis.get(`token:${token}`);
  if (cached) {
    return JSON.parse(cached);
  }
  // Validar i cachear
  const user = await authService.validateToken(token);
  await redis.setex(`token:${token}`, 300, JSON.stringify(user));
  return user;
}
```

**✅ PROS:**
- **Escalabilitat**: Compartit entre instàncies
- **Persistència**: Sobreviu a reinicis
- **TTL**: Gestió automàtica d'expiració
- **Consistència**: Única font de veritat

**❌ CONTRES:**
- **Complexitat**: Infraestructura adicional
- **Dependència**: Punt de fallada adicional
- **Latència**: Xarxa cap a Redis
- **Costs**: Recursos addicionals

**🎯 RECOMANACIÓ**: **Opció B** per començar, **Opció C** per escalabilitat.

---

### **5. 📊 LOGGING I AUDITORIA**

#### **OPCIÓ A: Logging Mínim**
```typescript
server.log.info('WebSocket connection established', { userId });
server.log.info('WebSocket connection closed', { userId });
```

**✅ PROS:**
- **Rendiment**: Mínim overhead
- **Simplicitat**: Menys codi
- **Neteja**: Logs nets
- **Recursos**: Menys I/O

**❌ CONTRES:**
- **Debugging**: Difícil trobar problemes
- **Auditoria**: Poca informació per compliance
- **Monitoring**: Difícil detectar patrons
- **Seguretat**: Menys informació per detectar atacs

#### **OPCIÓ B: Logging Detallat**
```typescript
server.log.info('WebSocket connection established', {
  userId,
  ip: request.ip,
  userAgent: request.headers['user-agent'],
  timestamp: new Date().toISOString()
});

server.log.debug('WebSocket message received', {
  userId,
  messageType: message.type,
  messageSize: JSON.stringify(message).length
});
```

**✅ PROS:**
- **Debugging**: Informació completa per debugging
- **Auditoria**: Compleix requisits de compliance
- **Monitoring**: Detecta patrons i problemes
- **Seguretat**: Informació per detectar atacs

**❌ CONTRES:**
- **Rendiment**: Overhead per cada operació
- **Espai**: Logs ocupen molt espai
- **Privacitat**: Pot contenir informació sensible
- **Complexitat**: Més codi per mantenir

#### **OPCIÓ C: Logging Configurable**
```typescript
const LOG_LEVELS = {
  production: 'info',
  development: 'debug',
  testing: 'warn'
};

if (config.nodeEnv === 'development') {
  server.log.debug('Detailed WebSocket info', { ...details });
}
server.log.info('WebSocket connection', { essentialInfo });
```

**✅ PROS:**
- **Flexibilitat**: Adapta't a l'entorn
- **Rendiment**: Logging mínim en producció
- **Debugging**: Detallat en development
- **Configurabilitat**: Ajustable segons necessitats

**❌ CONTRES:**
- **Complexitat**: Lògica condicional
- **Inconsistència**: Comportament diferent per entorn
- **Configuració**: Més paràmetres per gestionar

**🎯 RECOMANACIÓ**: **Opció C** amb logging detallat en development, mínim en producció.

---

## **🎯 RESUM DE RECOMANACIONS**

1. **Token Format**: Query Parameter (simple) → Headers (millor seguretat)
2. **Gestió d'Errors**: Tancar connexió (simple) → Renovació (millor UX)
3. **Múltiples Connexions**: Límit de 2-3 connexions per usuari
4. **Cache**: In-Memory (simple) → Redis (escalable)
5. **Logging**: Configurable per entorn

**Quina opció prefereixes per cada punt? O vols que comenci amb les recomanacions?**

CarlesEnric: apostaria per les opcions més fàcils a implementar, però abans de procedir vull que em quedi ben clar. El jwt no només s'implementa en els websockets...a on més s'implementa i a on més s'hauria d'implementar en aquest projecte?

GitHub Copilot: Excellent pregunta! Tens raó, el JWT no és només per WebSockets. Deixa'm explicar-te **on més s'implementa i on s'hauria d'implementar** en tot el projecte ft_transcendence: Perfect! Ara tinc una visió clara del projecte complet. Deixa'm explicar-te **on més s'implementa i s'hauria d'implementar JWT** a tot el projecte:

## **🔐 JWT EN TOT EL PROJECTE FT_TRANSCENDENCE**

### **1. 🎯 ON S'IMPLEMENTA ACTUALMENT (i on falta)**

#### **A. API GATEWAY** (On estàs ara)
```typescript
// ACTUAL: Només proxy sense autenticació
setupProxyRoute(server, '/api/auth', config.services.auth);
setupProxyRoute(server, '/api/users', config.services.user);
// ... altres routes

// FALTA: Middleware JWT per validar abans del proxy
```

**On s'hauria d'implementar:**
- **Middleware d'autenticació** per a totes les rutes `/api/*` (excepte login/register)
- **Validació JWT** abans de fer proxy als microserveis
- **WebSocket authentication** (el que volies implementar)
- **Rate limiting** per usuari autenticat

#### **B. AUTH-SERVICE** (Generador de JWT)
```typescript
// FALTA: Tot el servei d'autenticació
// - Generar JWT tokens
// - Validar JWT tokens
// - Refresh tokens
// - 2FA integration
// - Google Sign-in
```

**Responsabilitats:**
- **Emetre JWT** després de login exitós
- **Validar JWT** quan altres serveis ho demanen
- **Renovar tokens** (refresh tokens)
- **Gestionar 2FA** segons el README
- **Integrar Google Sign-in** segons el README

#### **C. MICROSERVEIS** (Consumers de JWT)
```typescript
// FALTA: Middleware JWT en tots els microserveis
// - user-service
// - game-service  
// - match-service
```

**On s'hauria d'implementar:**
- **Middleware JWT** per protegir endpoints interns
- **Validació d'usuari** en cada petició
- **Autorització** segons permisos d'usuari

#### **D. FRONTEND** (Client JWT)
```typescript
// FALTA: Gestió JWT al frontend
// - Emmagatzemar tokens
// - Enviar tokens en peticions
// - Renovar tokens automàticament
// - Gestionar expiració
```

---

### **2. 🚀 FLUX COMPLET D'AUTENTICACIÓ JWT**

#### **Login Flow:**
```
1. USER → FRONTEND: Credencials (email/password)
2. FRONTEND → API-GATEWAY → AUTH-SERVICE: POST /api/auth/login
3. AUTH-SERVICE: Valida credencials + genera JWT
4. AUTH-SERVICE → API-GATEWAY → FRONTEND: JWT token
5. FRONTEND: Guarda token (localStorage/cookie)
```

#### **API Request Flow:**
```
1. FRONTEND → API-GATEWAY: GET /api/users/profile (amb JWT header)
2. API-GATEWAY: Valida JWT amb AUTH-SERVICE
3. API-GATEWAY → USER-SERVICE: GET /users/profile (amb user info)
4. USER-SERVICE → API-GATEWAY → FRONTEND: Dades d'usuari
```

#### **WebSocket Flow:**
```
1. FRONTEND → API-GATEWAY: WebSocket connection (amb JWT)
2. API-GATEWAY: Valida JWT amb AUTH-SERVICE
3. API-GATEWAY: Estableix connexió amb context d'usuari
4. Missatges: Sempre amb context d'usuari validat
```

---

### **3. 📋 IMPLEMENTACIÓ PRIORITÀRIA**

#### **FASE 1: AUTH-SERVICE (Fonament)**
```typescript
// Endpoints necessaris:
POST /api/auth/login          // Login básic
POST /api/auth/register       // Registre
POST /api/auth/validate-token // Validar JWT (per API Gateway)
POST /api/auth/refresh        // Renovar token
GET  /api/auth/me            // Info usuari actual
```

#### **FASE 2: API GATEWAY (Seguretat)**
```typescript
// Middleware JWT per API routes
app.register(jwtMiddleware, { prefix: '/api' });

// Excludes (no necessiten JWT)
const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/google',
  '/api/health'
];
```

#### **FASE 3: MICROSERVEIS (Interns)**
```typescript
// Cada microservei ha de:
// 1. Rebre user info de l'API Gateway
// 2. Validar permisos específics
// 3. Processar segons usuari
```

#### **FASE 4: FRONTEND (Client)**
```typescript
// Axios interceptors per afegir JWT
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### **FASE 5: WEBSOCKETS (Temps real)**
```typescript
// Validació JWT per WebSocket (el que volies fer)
const connection = new WebSocket('ws://localhost/ws/game?token=' + jwt);
```

---

### **4. 🔒 RUTES QUE NECESSITEN JWT**

#### **Rutes PÚBLIQUES (sense JWT):**
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/google
GET  /api/health
GET  /api/auth/google/callback
```

#### **Rutes PRIVADES (amb JWT):**
```
# User Management
GET    /api/users/profile
PUT    /api/users/profile
POST   /api/users/upload-avatar
GET    /api/users/friends
POST   /api/users/add-friend

# Game Management
GET    /api/games/active
POST   /api/games/join
POST   /api/games/create
GET    /api/games/history

# Match Management
GET    /api/matches/history
POST   /api/matches/create
GET    /api/matches/stats


#### **WebSocket PRIVAT:**
```
ws://host/ws/game           # Necessita JWT
ws://host/ws/notifications  # Necessita JWT
```

---

### **5. 🎯 IMPLEMENTACIÓ RECOMANADA**

Segons les opcions més simples que volies:

#### **Per API Gateway:**
1. **Middleware JWT** que intercepta `/api/*` (excepte públiques)
2. **Validació amb AUTH-SERVICE** via HTTP call
3. **Cache in-memory** per tokens validats (5 minuts)
4. **Forward user info** als microserveis

#### **Per WebSockets:**
1. **Token via query parameter** (més simple)
2. **Tancar connexió** si token invàlid (més simple)
3. **Límit 2 connexions per usuari** (equilibrat)
4. **Logging configurable** per entorn

#### **Per Frontend:**
1. **LocalStorage** per guardar token
2. **Axios interceptors** per afegir automàticament
3. **Redirect a login** si 401

---

### **❓ PREGUNTA CRUCIAL:**

**Vols començar implementant:**
1. **AUTH-SERVICE** primer (crear JWT tokens)?
2. **API GATEWAY middleware** primer (validar JWT)?
3. **WebSocket authentication** primer (com volies inicialment)?

**La recomanació és fer-ho en ordre: AUTH-SERVICE → API GATEWAY → WebSockets → Frontend**

Què prefereixes?

CarlesEnric: el que proposes, comencem per el punt 1

GitHub Copilot: Perfecte! Comencem per el **punt 1: AUTH-SERVICE** (el fonament). Primer deixa'm veure què hi ha al auth-service i després t'explicaré exactament què faré: Perfect! Veig que l'auth-service té les dependencies necessàries (fastify, JWT, bcrypt, sqlite3, 2FA) però només té un placeholder. Ara t'explicaré exactament què faré:

## **🔐 PLAN D'IMPLEMENTACIÓ AUTH-SERVICE**

### **Què crearé:**

1. **Estructura base del servei:**
   - server.ts - Configuració del servidor Fastify
   - index.ts - Configuració (ports, secrets, DB)
   - index.ts - Connexió SQLite
   - index.ts - Tipus TypeScript

2. **Autenticació bàsica:**
   - `src/routes/auth.ts` - Endpoints d'autenticació
   - `src/middleware/validation.ts` - Validació de dades
   - `src/services/auth.service.ts` - Lògica d'autenticació
   - `src/utils/jwt.ts` - Gestió JWT tokens

3. **Endpoints que implementaré:**
   ```typescript
   POST /api/auth/register        // Registre usuari
   POST /api/auth/login          // Login usuari
   POST /api/auth/validate-token // Validar JWT (per API Gateway)
   POST /api/auth/refresh        // Renovar token
   GET  /api/auth/me            // Info usuari actual
   ```

4. **Base de dades:**
   - Taula `users` amb camps necessaris
   - Migracions automàtiques
   - Gestió de contrasenyes encriptades

5. **Seguretat:**
   - Contrasenyes hasheades amb bcrypt
   - JWT tokens amb expiració
   - Refresh tokens
   - Validació de dades amb Zod

### **Ordre d'implementació:**

1. **Configuració base** (server, config, database)
2. **Tipus i validacions** (TypeScript types, Zod schemas)
3. **Servei d'autenticació** (registre, login, validació)
4. **Endpoints REST** (rutes HTTP)
5. **Proves bàsiques** (verificar que funciona)

### **Exemples del que faré:**

#### **JWT Token que generaré:**
```typescript
const payload = {
  id: user.id,
  username: user.username,
  email: user.email,
  roles: user.roles || ['user']
};
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
```

#### **Endpoint de validació per API Gateway:**
```typescript
POST /api/auth/validate-token
Body: { token: "eyJhbGciOiJIUzI1NiIs..." }
Response: { 
  valid: true, 
  user: { id: 1, username: "player1", email: "..." }
}
```

### **Beneficis:**
- **API Gateway** podrà validar tokens fàcilment
- **WebSockets** podran usar la validació
- **Frontend** tindrà endpoints per login/register
- **Base sòlida** per afegir 2FA i Google OAuth després

Tens molta raó! Deixa'm explicar-te **cada cosa que no entens** de manera clara:

## **🔍 EXPLICACIÓ DETALLADA**

### **1. `parseInt(process.env.PORT || '443', 10)`**

#### **Què fa cada part:**
```typescript
process.env.PORT           // Variable d'entorn del sistema
||                        // Operador "o" (si no existeix, usa el següent)
'443'                    // Valor per defecte si no hi ha variable
parseInt(...)             // Converteix string a número
, 10                      // Base 10 (decimal normal)
```

#### **Exemple pràctic:**
```typescript
// Si Docker defineix PORT=8080
parseInt(process.env.PORT || '443', 10) // → 8080

// Si Docker NO defineix PORT
parseInt(process.env.PORT || '443', 10) // → 443

// El 10 significa base decimal:
parseInt('443', 10) // → 443 (decimal)
parseInt('443', 8)  // → 1537 (octal)
parseInt('443', 16) // → 12289 (hexadecimal)
```

---

## **🔐 JWT EXPLICACIÓ SIMPLE**

### **1. Què és un JWT?**
```typescript
// JWT és com una "targeta d'identitat digital"
const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJwbGF5ZXIxIn0.signature"
```

### **2. Configuració JWT:**
```typescript
jwt: {
  secret: 'clau-secreta',     // ← Clau per firmar/verificar
  expiresIn: '1h',           // ← El token es torna invàlid després d'1 hora
  refreshExpiresIn: '7d',    // ← El refresh token dura 7 dies
}
```

### **3. Què passa quan expira?**

#### **Escenari 1: Token expira (1h)**
```typescript
// Usuari fa petició després d'1 hora
GET /api/users/profile
Authorization: Bearer [token_expired]

// Resposta:
401 Unauthorized: "Token expired"
```

#### **Escenari 2: Renovació automàtica**
```typescript
// Frontend detecta 401 i renova automàticament:
POST /api/auth/refresh
Body: { refreshToken: "..." }

// Resposta:
{ accessToken: "new_token", refreshToken: "new_refresh" }
```

### **4. Renovació manual vs automàtica:**

#### **Manual (usuari ha de fer login):**
```typescript
// Quan token expira:
// 1. Redirect a login
// 2. Usuari introdueix credencials
// 3. Nou token generat
```

#### **Automàtica (més fluid):**
```typescript
// Quan token expira:
// 1. Frontend usa refresh token
// 2. Nou token obtingut transparent
// 3. Usuari no se n'adona
```

---

## **🔑 BCRYPT EXPLICACIÓ**

### **1. Què és saltRounds?**
```typescript
bcrypt: {
  saltRounds: 12,  // ← Nombre de vegades que s'aplica l'algoritme
}
```

### **2. Més rounds = Més segur però més lent:**
```typescript
// saltRounds: 10 → ~100ms per hash
// saltRounds: 12 → ~300ms per hash  ← Balanç recomanat
// saltRounds: 14 → ~1000ms per hash
```

---
CORS = Cross-Origin Resource Sharing

// Sense CORS:
// Frontend: http://localhost:5173
// Backend:  http://localhost:3000
// ❌ El navegador bloqueja la petició per "origen diferent"

Headers CORS típics:
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
---

!!! dotenv, per tenir dos entorns diferents a la vegada: desenvolupament i producció !!!

---

## **📊 ESTAT ACTUAL DE L'AUTENTICACIÓ**

### **✅ QUÈ S'HA IMPLEMENTAT (COMPLET):**

#### **1. AUTH-SERVICE - Base Funcional:**
- **✅ Estructura completa**: Tot el codi està implementat
- **✅ Base de dades**: SQLite amb taules `users`, `oauth_users`, `sessions`
- **✅ Endpoints funcionals**:
  - `POST /register` - Registre usuaris
  - `POST /login` - Login tradicional  
  - `GET /validate` - Validació JWT tokens
  - `GET /profile` - Perfil usuari autenticat
  - `GET /auth/google` - OAuth2 Google (complet)
  - `GET /auth/google/callback` - Callback OAuth2

#### **2. Funcionalitats de Seguretat:**
- **✅ Bcrypt**: Hash contrasenyes (12 rounds)
- **✅ JWT tokens**: Generació i validació
- **✅ Validació Zod**: Input validation
- **✅ Google OAuth2**: Implementació completa
- **✅ Protecció SQL injection**: Prepared statements

#### **3. Base de Dades:**
- **✅ Taula users**: Amb suport OAuth2 i traditional
- **✅ Taula sessions**: Gestió tokens
- **✅ Índexs**: Optimització consultes

---

## **❌ QUÈ ENS FALTA PER COMPLETAR:**

### **1. API GATEWAY - JWT MIDDLEWARE:**
```typescript
// FALTA: Middleware per validar JWT abans de proxy
// Necessari per protegir tots els endpoints /api/*
```

### **2. MICROSERVEIS - JWT VALIDATION:**
```typescript
// FALTA: Middleware JWT a cada microservei
// - user-service
// - game-service  
// - match-service
// - notification-service
```

### **3. WEBSOCKETS - JWT AUTHENTICATION:**
```typescript
// FALTA: Validació JWT per WebSocket connections
// El que volies implementar inicialment
```

### **4. FRONTEND - JWT CLIENT:**
```typescript
// FALTA: Gestió JWT al React frontend
// - Emmagatzemar tokens
// - Axios interceptors
// - Renovació automàtica
```

### **5. FUNCIONALITATS AVANÇADES:**
```typescript
// FALTA (però no prioritari):
// - Refresh tokens automàtics
// - 2FA (base ja preparada)
// - Logout amb invalidació tokens
// - Rate limiting per usuari
```

---

## **🎯 PRÒXIMS PASSOS RECOMANATS:**

### **OPCIÓ 1: WebSockets (el que volies fer)** 🚀
```typescript
// Implementar JWT per WebSockets a API Gateway
// - Validació token via query parameter
// - Gestió connexions per usuari
// - Context d'usuari per cada missatge
```

### **OPCIÓ 2: API Gateway Middleware** 🛡️
```typescript
// Protegir tots els endpoints /api/*
// - Middleware JWT centralitzat
// - Cache tokens validats
// - Forward user info als microserveis
```

### **OPCIÓ 3: Frontend Integration** 🎨
```typescript
// Implementar client JWT al React
// - Login/register forms
// - Token management
// - Axios interceptors
```

---

## **📋 SEGÜENT:**


### **🎯 OPCIÓ A: Continuar amb WebSockets JWT** 
- Implementar autenticació JWT per WebSockets
- Gestió de connexions autenticades
- Validació per cada missatge

### **🎯 OPCIÓ B: Completar API Gateway Middleware**
- Protegir tots els endpoints abans de continuar
- Base sòlida per a tots els microserveis
- Menys duplicació de codi

### **🎯 OPCIÓ C: Test AUTH-SERVICE primer**
- Verificar que tot funciona correctament
- Provar endpoints amb cURL/Postman
- Assegurar base sòlida

---

Implementar middleware JWT centralitzat a l'API Gateway que protegeixi tots els endpoints /api/* excepte els públics, i forward la informació d'usuari als microserveis.

📂 FITXERS QUE MODIFICARÉ:
1. index.ts
2. src/server.ts
3. index.ts
4. src/routes/proxy.ts
5. index.ts
🔍 LÒGICA DETALLADA:
1. Middleware JWT (registerJWTAuth):
2. Rutes Públiques (no necessiten JWT):
3. Cache In-Memory (simple):
4. Validació amb Auth-Service:
5. Forward User Info:
⚙️ CONFIGURACIÓ (.env):
🎯 BENEFICIS D'AQUESTA IMPLEMENTACIÓ:
1. Seguretat Centralitzada:
Un sol punt de validació JWT
Protecció automàtica de tots els endpoints nous
Gestió consistent d'errors d'autenticació
2. Rendiment Optimitzat:
Cache in-memory per tokens validats
Menys càrrega a l'Auth-Service
Latència reduïda per requests autenticats
3. Integració Seamless:
Microserveis reben user info automàticament
No cal duplicar validació JWT a cada servei
API consistent per a tots els serveis
4. Mantenibilitat:
Configuració centralitzada de rutes públiques
Logging consistent per debugging
Fàcil desactivar JWT si cal
🔄 FLUX COMPLET:
📋 ORDRE D'IMPLEMENTACIÓ:
Tipus TypeScript (interfaces JWT)
Configuració (config JWT, .env)
Middleware JWT (validació + cache)
Integració server (registrar middleware)
Proxy enhancement (forward user info)
Testing (verificar endpoints protegits)
🚀 RESULTAT FINAL:
Després d'aquesta implementació:

✅ Tots els endpoints /api/* estaran protegits per JWT
✅ Rutes públiques funcionaran sense token
✅ Microserveis rebran informació d'usuari automàticament
✅ Base sòlida per implementar WebSockets després
✅ Performance optimitzat amb cache
---