# Auth Service

## Overview

The Auth Service handles user authentication and authorization for the ft_transcendence project. It provides JWT-based authentication with user registration, login, and token validation endpoints.

## Architecture

The service follows a modular architecture with separated concerns:

```
src/
├── config/         # Configuration settings
│   └── index.ts    # Environment variables and app config
├── middleware/     # Custom middleware
│   └── index.ts    # Middleware registration
├── routes/         # API route handlers
│   ├── auth.ts     # Authentication endpoints
│   ├── oauth.ts    # OAuth2 endpoints (Google)
│   └── health.ts   # Health check endpoints
├── types/          # TypeScript type definitions
│   └── auth.types.ts # User and session types
├── utils/          # Utility functions
│   ├── auth.ts     # JWT and password utilities
│   ├── oauth.ts    # OAuth2 utilities and Google integration
│   ├── database.ts # Database operations
│   └── validation.ts # Input validation with Zod
├── index.ts        # Main entry point
└── server.ts       # Server configuration
```

## API Endpoints

### Authentication
- `POST /register` - User registration with validation
- `POST /login` - User authentication
- `GET /validate` - JWT token validation

### OAuth2 (Google)
- `GET /auth/google` - Initialize Google OAuth2 flow
- `GET /auth/google/callback` - Handle Google OAuth2 callback
- `GET /auth/profile` - Get authenticated user profile (requires JWT)

### Health
- `GET /health` - Service health check

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | development | Environment mode |
| `PORT` | 443 | Server port |
| `HOST` | 0.0.0.0 | Server host |
| `LOG_LEVEL` | info | Logging level |
| `DB_PATH` | /app/database/auth.db | SQLite database path |
| `JWT_SECRET` | - | JWT signing secret (required) |
| `JWT_EXPIRES_IN` | 24h | JWT token expiration |
| `BCRYPT_ROUNDS` | 12 | Password hashing rounds |
| `GOOGLE_CLIENT_ID` | - | Google OAuth2 client ID (required) |
| `GOOGLE_CLIENT_SECRET` | - | Google OAuth2 client secret (required) |
| `OAUTH_CALLBACK_URL` | - | OAuth2 callback URL (required) |
| `FRONTEND_URL` | - | Frontend URL for redirects (required) |

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- NULL for OAuth2 users
  google_id TEXT UNIQUE, -- Google OAuth2 ID
  profile_picture TEXT, -- Profile picture URL
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## API Examples

### Register User
```bash
curl -X POST https://auth:443/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

### Login User
```bash
curl -X POST https://auth:443/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "securePassword123"
  }'
```

### Validate Token
```bash
curl -X GET https://auth:443/validate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### OAuth2 Examples

#### Start Google OAuth2 Flow
```bash
# Redirect user to this URL
curl -X GET https://auth:443/auth/google
```

#### Get User Profile (after OAuth2 login)
```bash
curl -X GET https://auth:443/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### OAuth2 Flow Example
1. Frontend redirects user to `/auth/google`
2. User authenticates with Google
3. Google redirects to `/auth/google/callback`
4. Service exchanges code for tokens and creates/updates user
5. Service redirects to frontend with JWT token

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check
```

## Docker

```bash
# Build image
docker build -t transcendence/auth .

# Run container
docker run -p 443:443 \
  -e JWT_SECRET=your-secret-key \
  -e DB_PATH=/app/database/auth.db \
  transcendence/auth
```

## Technology Stack

- **Framework**: Fastify
- **Database**: SQLite3
- **Authentication**: JWT (jsonwebtoken)
- **OAuth2**: Google OAuth2 with googleapis
- **Password Hashing**: bcrypt (12 rounds)
- **Validation**: Zod
- **Language**: TypeScript
- **Container**: Docker (Alpine Linux)

## Security Features

- ✅ Secure password hashing with bcrypt
- ✅ JWT token authentication with expiration
- ✅ OAuth2 integration with Google
- ✅ State parameter validation for OAuth2
- ✅ Secure token exchange and user creation
- ✅ Input validation and sanitization
- ✅ SQL injection protection
- ✅ Duplicate user prevention
- ✅ Environment-based configuration
- ✅ Comprehensive error handling
- Registre de nous usuaris
- Login/logout d'usuaris
- Generació i validació de tokens JWT
- Gestió de sessions d'usuari
- Validació de credencials

### **Endpoints**
- `POST /register` - Registre nou usuari
- `POST /login` - Login usuari existent
- `POST /logout` - Logout usuari
- `GET /verify` - Verificar token JWT
- `POST /refresh` - Renovar token JWT

### **Base de Dades**
- **Arxiu:** `database/auth/users_auth.db`
- **Taules:** 
  - `users` - Credencials d'usuari
  - `sessions` - Sessions actives

### **Tecnologies**
- Fastify (servidor web)
- JWT (tokens d'autenticació)
- bcrypt (hash de contrasenyes)
- SQLite (base de dades)
- Zod (validació d'entrada)
- crypto (Node.js natiu per generació segura aleatòria)
- speakeasy (generació TOTP per 2FA)
- qrcode (generació codis QR per configuració 2FA)

---

## **Development**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## **Database Schema**

```sql
-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```
