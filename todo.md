1. Estructura de directoris del projecte

Una estructura senzilla i ben organitzada podria ser així:

/my-app
│
├── /node_modules        # Dependències instal·lades
├── /public              # Conté fitxers estàtics com index.html, css, js, etc.
├── /src
│   ├── /controllers     # Conté les rutes i controladors de l'aplicació
│   ├── /plugins         # Per a plugins com OAuth2, JWT, SQLite
│   ├── /services        # Per a la lògica de negoci, per exemple, autenticació
│   ├── index.ts         # Arxiu principal del servidor
├── /docker-compose.yml  # Fitxer per a la configuració de Docker
├── /package.json        # Dependències del projecte i scripts
├── /tsconfig.json       # Configuració de TypeScript
├── /public              # Per a HTML estàtic com el fitxer index.html
└── /db.sqlite            # Base de dades SQLite

Amb aquesta estructura, tenim els següents directoris:

    /src: On escriurem tota la lògica de l'aplicació (rutes, serveis, etc.).

    /public: Aquí posarem arxius estàtics com HTML, CSS, i JS (p. ex., el fitxer index.html).

    /plugins: Per a configuracions específiques de Fastify com la integració amb OAuth2 i SQLite.

    index.ts: Aquest serà l'entrada principal del servidor Fastify.

2. Arxius de codi

a) src/index.ts (Arxiu principal)

Aquest arxiu serà el punt d'entrada de la teva aplicació. Aquí registraràs els plugins de Fastify (OAuth2, JWT, SQLite) i les rutes que necessites.

import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import jwt from '@fastify/jwt';
import oauth2 from '@fastify/oauth2';
import path from 'path';
import { dbPlugin } from './plugins/db';
import { oauth2Plugin } from './plugins/oauth2';
import { authRoutes } from './controllers/authController';

const fastify = Fastify();

fastify.register(websocket);
fastify.register(jwt, { secret: 'supersecret' });

// Registrar la connexió a la base de dades SQLite
fastify.register(dbPlugin);

// Registrar el plugin de OAuth2 (Google)
fastify.register(oauth2Plugin);

// Registrar les rutes d'autenticació
fastify.register(authRoutes);

// Servei d'arxius estàtics (HTML, CSS, JS)
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, '../public'),
  prefix: '/public/', // Serveix arxius des de /public/
});

fastify.get('/', (request, reply) => {
  reply.sendFile('index.html'); // Serveix el fitxer index.html
});

fastify.listen({ port: 7000, host: '0.0.0.0' }, (err: Error | null) => {
  if (err) throw err;
  console.log('Server listening on http://localhost:7000');
});

b) src/plugins/db.ts (Conexió a SQLite)

Aquest arxiu configura la connexió a la base de dades SQLite i la registre com a plugin de Fastify per poder utilitzar-la a tot arreu.

import { FastifyInstance } from 'fastify';
import sqlite3 from 'sqlite3';

export const dbPlugin = async (fastify: FastifyInstance) => {
  fastify.decorate('db', new sqlite3.Database('db.sqlite', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error('Error al connectar-se a la base de dades SQLite:', err);
    } else {
      console.log('Base de dades SQLite connectada correctament');
    }
  }));

  // Inicialitza la base de dades, creant taules si no existeixen
  fastify.decorate('initDb', () => {
    fastify.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE
      );
    `);
  });

  // Inicia la base de dades en iniciar el servidor
  fastify.initDb();
};

c) src/plugins/oauth2.ts (Configuració de OAuth2 - Google)

Aquí és on configurarem el plugin de Google OAuth2 per la autenticació.

import { FastifyInstance } from 'fastify';
import oauth2 from '@fastify/oauth2';

export const oauth2Plugin = async (fastify: FastifyInstance) => {
  fastify.register(oauth2, {
    name: 'googleOAuth2',
    scope: ['profile', 'email'],
    credentials: {
      client: {
        id: 'GOOGLE_CLIENT_ID',
        secret: 'GOOGLE_CLIENT_SECRET'
      }
    },
    startRedirectPath: '/login/google',
    callbackUri: 'http://localhost:7000/login/google/callback',
    discovery: {
      issuer: 'https://accounts.google.com'
    }
  });
};

d) src/controllers/authController.ts (Rutes d'autenticació)

Aquest arxiu contindrà les rutes per a gestionar el flux d'autenticació amb Google.

import { FastifyInstance } from 'fastify';

export const authRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/login/google', async (request, reply) => {
    const authorizationUrl = fastify.googleOAuth2.authorizeURL();
    reply.redirect(authorizationUrl);
  });

  fastify.get('/login/google/callback', async (request, reply) => {
    try {
      const token = await fastify.googleOAuth2.getToken(request.query.code);
      const user = await fastify.googleOAuth2.getUserInfo(token);

      fastify.db.get('SELECT * FROM users WHERE email = ?', [user.email], (err, row) => {
        if (err) {
          console.error('Error checking user in the database:', err);
          reply.send({ error: 'Database error' });
        }

        if (!row) {
          fastify.db.run('INSERT INTO users (name, email) VALUES (?, ?)', [user.name, user.email], (err) => {
            if (err) {
              console.error('Error inserting user into the database:', err);
              reply.send({ error: 'Database error' });
            } else {
              reply.send({ message: 'User created' });
            }
          });
        } else {
          const jwtToken = fastify.jwt.sign({ userId: row.id });
          reply.send({ message: 'User logged in', token: jwtToken });
        }
      });
    } catch (err) {
      console.error('Error during OAuth2 callback:', err);
      reply.send({ error: 'OAuth2 error' });
    }
  });
};

e) public/index.html (Frontend)

Aquest arxiu seria la teva pàgina d'inici, on pots tenir un botó de login per redirigir a Google per autenticar-se.

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fastify OAuth2</title>
</head>
<body>
  <h1>Welcome to Fastify OAuth2 Example</h1>
  <a href="/login/google">Login with Google</a>
</body>
</html>

3. Instal·la les dependències necessàries

Asegura't de tenir totes les dependències necessàries instal·lades:

npm install fastify @fastify/websocket @fastify/jwt @fastify/oauth2 sqlite3
npm install --save-dev typescript ts-node @types/node

4. Configuració de TypeScript (tsconfig.json)

Si encara no tens un fitxer tsconfig.json, aquí tens un exemple bàsic de configuració per TypeScript:

{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}

5. Dockerització del projecte

Crea un fitxer `Dockerfile` a l'arrel del projecte:

```Dockerfile
# Dockerfile
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 7000

CMD ["npm", "run", "start"]
```

Crea un fitxer `docker-compose.yml` a l'arrel del projecte:

```yaml
services:
  app:
    build: .
    ports:
      - "7000:7000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

Amb aquests fitxers podràs construir i executar el projecte amb Docker:

```sh
docker-compose up --build
```

6.package.json

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "description": "Exemple Fastify OAuth2 amb TypeScript i SQLite",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts"
  },
  "author": "",
  "license": "MIT",
  "dependencies": {
    "@fastify/jwt": "^7.0.0",
    "@fastify/oauth2": "^7.4.0",
    "@fastify/static": "^7.6.0",
    "@fastify/websocket": "^7.0.0",
    "fastify": "^5.0.0",
    "sqlite3": "^5.1.6"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "ts-node": "^10.9.1",
    "typescript": "^5.0.0"
  }
}
```

---------------------------------------------------------------------------------

## **Step 1: Define Your Microservices**

You’ll have these services:

1. **database**: Handles SQLite DB access (exposes an API for CRUD operations).
2. **server**: Handles core backend logic (API endpoints, business logic).
3. **auth**: Handles authentication (OAuth2, JWT, user management).
4. **pong**: Handles game logic (or game hub).
5. **frontend**: Serves static frontend files (SPA).
6. **api-gateway**: Routes requests to the correct microservice.

---

## **Step 2: Project Structure**

```
ft_transcendence/
│
├── docker-compose.yml
├── database/
│   ├── Dockerfile
│   ├── .env
│   └── src/
│       └── index.ts
├── server/
│   ├── Dockerfile
│   ├── .env
│   └── src/
│       └── index.ts
├── auth/
│   ├── Dockerfile
│   ├── .env
│   └── src/
│       └── index.ts
├── pong/
│   ├── Dockerfile
│   ├── .env
│   └── src/
│       └── index.ts
├── frontend/
│   ├── Dockerfile
│   ├── .env
│   ├── public/
│   │   └── index.html
│   └── src/
│       └── main.ts
└── api-gateway/
    ├── Dockerfile
    ├── .env
    └── src/
        └── index.ts
```

---

## **Step 3: Update docker-compose.yml**

````yaml
version: '3.8'

services:
  database:
    build: ./database
    ports:
      - "6000:6000"
    env_file:
      - ./database/.env
    volumes:
      - db_data:/app/data
    restart: unless-stopped

  server:
    build: ./server
    ports:
      - "7000:7000"
    env_file:
      - ./server/.env
    depends_on:
      - database
    restart: unless-stopped

  auth:
    build: ./auth
    ports:
      - "7001:7001"
    env_file:
      - ./auth/.env
    depends_on:
      - database
    restart: unless-stopped

  pong:
    build: ./pong
    ports:
      - "4000:4000"
    env_file:
      - ./pong/.env
    depends_on:
      - database
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    env_file:
      - ./frontend/.env
    restart: unless-stopped

  api-gateway:
    build: ./api-gateway
    ports:
      - "8000:8000"
    env_file:
      - ./api-gateway/.env
    depends_on:
      - server
      - auth
      - pong
      - frontend
    restart: unless-stopped

volumes:
  db_data:
````

---

## **Step 4: Service Responsibilities**

- **database**:  
  - Exposes REST/gRPC API for DB operations (using SQLite).
  - All other services interact with the DB via this API, not direct file access.

- **server**:  
  - Handles main API logic, fetches/stores data via `database` service API.

- **auth**:  
  - Handles login, registration, JWT, OAuth2.
  - Talks to `database` for user info.

- **pong**:  
  - Handles game logic, can store/retrieve scores via `database`.

- **frontend**:  
  - Serves static files (HTML, JS, CSS).

- **api-gateway**:  
  - Routes requests to the correct service (e.g., `/api/auth/*` → `auth`, `/api/game/*` → `pong`, `/api/*` → `server`).

---

## **Step 5: How to Migrate Your Code**

1. **Move DB logic** from plugins/db.ts into the `database` service.  
   - Expose endpoints like `/users`, `/games`, etc.
   - Use SQLite as before, but only the `database` service touches the DB file.

2. **Update other services** to call the `database` service API instead of using SQLite directly.

3. **Move authentication logic** from `authController.ts` and `oauth2.ts` into the `auth` service.

4. **Move business logic** (non-auth API endpoints) into the `server` service.

5. **Move game logic** into the `pong` service.

6. **Move static files** into `frontend/public/` and serve them with a simple Node or Nginx server.

7. **Implement `api-gateway`** as a simple proxy (e.g., with Express or Fastify) that forwards requests to the right service.

---

## **Step 6: Communication Example**

- `auth` wants to get a user:  
  `GET http://database:6000/users/:id`
- `server` wants to get a list of games:  
  `GET http://database:6000/games`
- `pong` wants to save a score:  
  `POST http://database:6000/scores`

---

## **Step 7: Keep SQLite**

- Only the `database` service accesses the SQLite file directly.
- All other services use HTTP requests to interact with the DB.

---

## **Step 8: Next Steps**

1. Scaffold each service with a basic Fastify/Express app and Dockerfile.
2. Move your existing logic into the correct service.
3. Refactor DB access to go through the `database` service API.
4. Test communication between services using Docker Compose.

---

**Would you like a sample implementation for the `database` service or a specific service to start with?**  
Let me know which one you want to see first!
