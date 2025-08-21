# 🚪 API Gateway - Punt d'Entrada del Sistema

## 📋 Visió General

L'API Gateway és el **punt d'entrada únic** del sistema ft_transcendence. Actua com a reverse proxy, serveix el frontend React i gestiona la seguretat i comunicació entre microserveis.

## 🏗️ Arquitectura

```
Client (Browser)
    ↓ HTTPS (443)
API Gateway
    ├── Static Files → Frontend React SPA
    ├── /api/auth → Auth Service (3001)
    ├── /api/users → User Service (3002)  
    ├── /api/games → Game Service (3003)
    ├── /api/matches → Match Service (3004)
    └── /ws/* → WebSocket Routing
```

## 🔧 Tecnologies

- **Fastify**: Framework web HTTP/HTTPS
- **SSL/TLS**: Certificats auto-signats per HTTPS
- **WebSockets**: Comunicació en temps real
- **Rate Limiting**: Control de tràfic
- **CORS**: Cross-Origin Resource Sharing
- **Helmet**: Security headers

## 📁 Estructura del Codi

```
services/api-gateway/
├── src/
│   ├── index.ts          # Entry point principal
│   ├── server.ts         # Configuració servidor HTTPS
│   ├── config/
│   │   └── index.ts      # Configuració centralitzada
│   ├── middleware/
│   │   └── index.ts      # Middleware stack
│   ├── routes/
│   │   ├── health.ts     # Health checks
│   │   ├── proxy.ts      # Proxy configuration
│   │   └── websocket.ts  # WebSocket handling
│   ├── types/
│   │   └── index.ts      # TypeScript types
│   └── utils/
│       └── index.ts      # Utilitats generals
├── ssl/
│   ├── ssl.sh           # Script generació certificats
│   ├── cert.pem         # Certificat SSL
│   └── key.pem          # Clau privada SSL
├── Dockerfile           # Container configuration
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript config
```

## 🚀 Funcionalitats Principals

### 1. **Reverse Proxy**
```typescript
// Proxy routes a microserveis
setupProxyRoute(server, '/api/auth', config.services.auth);     // → auth-service:3001
setupProxyRoute(server, '/api/users', config.services.user);   // → user-service:3002
setupProxyRoute(server, '/api/games', config.services.game);   // → game-service:3003
setupProxyRoute(server, '/api/matches', config.services.match); // → match-service:3004
```

### 2. **Servidor d'Arxius Estàtics**
```typescript
// Serveix el frontend React SPA
await server.register(fastifyStatic, {
  root: path.join(__dirname, '../../../frontend/dist'),
  prefix: '/'
});

// Fallback per SPA routing
server.setNotFoundHandler(async (request, reply) => {
  return reply.sendFile('index.html');
});
```

### 3. **SSL/HTTPS Configuration**
```typescript
const serverOptions = {
  logger: { level: config.nodeEnv === 'production' ? 'info' : 'debug' },
  https: {
    key: fs.readFileSync('/app/ssl/key.pem'),
    cert: fs.readFileSync('/app/ssl/cert.pem')
  }
};
```

### 4. **Middleware Stack**
```typescript
export const registerAllMiddleware = async (server, config) => {
  await registerWebSocket(server);         // WebSocket support
  await registerSecurity(server);          // Helmet security headers
  await registerCORS(server, config);      // Cross-Origin Resource Sharing
  await registerRateLimit(server, config); // Rate limiting protection
  await registerStaticFiles(server, config); // Static file serving
};
```

### 5. **WebSocket Support**
```typescript
// Real-time communication per games
server.register(async (fastify) => {
  fastify.get('/ws/game', { websocket: true }, (connection, request) => {
    connection.on('message', (message) => {
      // TODO: Forward to game service WebSocket
      console.log('WebSocket message:', message.toString());
    });
  });
});
```

### 6. **Health Monitoring**
```typescript
// Health check endpoints
server.get('/health', async (_request, reply) => {
  return reply.send({ 
    status: 'ok', 
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

server.get('/health/services', async (_request, reply) => {
  // TODO: Check health of all microservices
  return reply.send({ status: 'ok', services: [...] });
});
```

## ⚙️ Configuració

### Environment Variables
```bash
# API Gateway Configuration
NODE_ENV=development
PORT=80
HTTPS_PORT=443

# SSL Configuration  
SSL_ENABLED=true
SSL_CERT_PATH=/app/ssl/cert.pem
SSL_KEY_PATH=/app/ssl/key.pem

# Services URLs (internal Docker network)
AUTH_SERVICE_URL=https://auth-service:3001
USER_SERVICE_URL=https://user-service:3002
GAME_SERVICE_URL=https://game-service:3003
MATCH_SERVICE_URL=https://match-service:3004

# Frontend Configuration
FRONTEND_URL=https://localhost
```

### Rate Limiting
```typescript
await server.register(import('@fastify/rate-limit'), {
  max: 100,          // 100 requests
  timeWindow: 60000  // per minute
});
```

### CORS Configuration
```typescript
await server.register(import('@fastify/cors'), {
  origin: [config.frontend.url],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});
```

## 🐳 Docker Configuration

### Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY tsconfig.json ./

# Generate SSL certificates
RUN mkdir -p ssl
COPY ssl/ssl.sh ./ssl/
RUN chmod +x ./ssl/ssl.sh && ./ssl/ssl.sh

# Build TypeScript
RUN npm run build

EXPOSE 80 443
CMD ["npm", "start"]
```

### Docker Compose
```yaml
api-gateway:
  build: ./services/api-gateway
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./frontend/dist:/app/frontend/dist:ro
  depends_on:
    - auth-service
    - user-service
    - game-service
    - match-service
  networks:
    - transcendence-network
```

## 🔍 Debugging i Monitoring

### Logs
```bash
# Veure logs del API Gateway
docker-compose logs -f api-gateway

# Logs en temps real
docker-compose logs -f --tail=100 api-gateway
```

### Health Checks
```bash
# Check API Gateway health
curl -k https://localhost/health

# Check services proxy
curl -k https://localhost/api/auth/health
curl -k https://localhost/api/users/health
```

### SSL Verification
```bash
# Verificar certificat SSL
openssl s_client -connect localhost:443 -servername localhost

# Generar nous certificats
cd services/api-gateway/ssl
./ssl.sh
```

## 🚀 Comandos Útils

### Development
```bash
# Construir i executar
docker-compose up --build api-gateway

# Executar només API Gateway
docker-compose up api-gateway

# Rebuild sense cache
docker-compose build --no-cache api-gateway
```

### Testing
```bash
# Test proxy routes
curl -k https://localhost/api/auth/health
curl -k https://localhost/api/users/health

# Test static file serving
curl -k https://localhost/

# Test WebSocket connection
wscat -c wss://localhost/ws/game
```

## 📊 Estat Actual

### ✅ Implementat
- Reverse proxy funcional per tots els microserveis
- SSL/HTTPS configuration amb certificats auto-signats
- Servidor d'arxius estàtics per React SPA
- Middleware stack complet (CORS, Rate Limiting, Security)
- WebSocket support básic
- Health monitoring endpoints
- Docker configuration completa

### ⚠️ En Desenvolupament
- WebSocket routing avançat
- Service discovery automatitzat
- Load balancing entre instances

### ❌ Pendent
- Monitoring avançat (metrics, tracing)
- Cacheing estratègic
- Circuit breaker pattern
- Service mesh integration

## 🎯 Pròxims Passos

1. **Implementar WebSocket routing** cap a game service
2. **Afegir service health checks** automàtics
3. **Implementar circuit breaker** per resiliència
4. **Afegir metrics collection** (Prometheus/Grafana)
5. **Load balancing** per múltiples instances

## 📝 Notes de Desenvolupament

- **Port 443**: HTTPS traffic amb SSL
- **Port 80**: HTTP redirect a HTTPS (opcional)
- **Certificats SSL**: Auto-signats, generat automàticament
- **Docker Network**: `transcendence-network` per comunicació interna
- **Static Files**: Frontend React servit des de `/app/frontend/dist`
- **Proxy Timeout**: 30 segons per evitar requests penjats

### server.ts 

// Registra fastify-cookie abans de fastify-jwt
server.register(fastifyCookie);

// Registra fastify-jwt amb suport per cookie
server.register(fastifyJwt, {
  secret: process.env.JWT_SECRET,
  cookie: { cookieName: 'jwt', signed: false }
});

// Middleware d’autenticació universal
server.decorate('authenticate', async (request: any, reply: any) => {
  // Logs útils per debug
  server.log.info('AUTHENTICATE CALLED for', request.url);
  server.log.info('[DEBUG] Incoming cookies:', request.cookies);
  server.log.info('[DEBUG] Incoming headers:', request.headers);
  // Validació JWT automàtica (header o cookie)
  await request.jwtVerify();
  server.log.info('[DEBUG] JWT verification successful');
  // (Opcional) Decodifica el payload per debug
  try {
    const token = request.cookies?.jwt || (request.headers['authorization']?.startsWith('Bearer ') ? request.headers['authorization'].substring(7) : undefined);
    if (token) {
      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf8'));
      server.log.info('[DEBUG] Decoded JWT payload:', payload);
    }
  } catch (e) {
    server.log.error('[DEBUG] Failed to decode JWT payload:', e);
  }
});
