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
    "fastify": "^4.25.0",
    "sqlite3": "^5.1.6"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "ts-node": "^10.9.1",
    "typescript": "^5.0.0"
  }
}
```

-----------------------------------------------------------------------------

Great! Here is the **full microservices structure** for your project, with the exact content for each main file.  
**Copy each file to the specified path.**  
You can expand each service as needed.

---

## 1. **Directory Structure**

```
ft_transcendence/
│
├── auth/
│   ├── src/
│   │   └── index.ts
│   ├── package.json
│   ├── Dockerfile
│   ├── tsconfig.json
│   └── .env
│
├── backend/
│   ├── src/
│   │   └── index.ts
│   ├── package.json
│   ├── Dockerfile
│   ├── tsconfig.json
│   └── .env
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   └── main.ts
│   ├── package.json
│   ├── Dockerfile
│   ├── tsconfig.json
│   └── .env
│
├── pong/
│   ├── src/
│   │   └── index.ts
│   ├── package.json
│   ├── Dockerfile
│   ├── tsconfig.json
│   └── .env
│
├── api-gateway/
│   ├── src/
│   │   └── index.js
│   ├── package.json
│   ├── Dockerfile
│   └── .env
│
├── docker-compose.yml
└── db_data/   # Docker volume for Postgres
```

---

## 2. **File Contents**

---

### **docker-compose.yml**
````yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: transcendence
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data
    restart: unless-stopped

  api-gateway:
    build: ./api-gateway
    ports:
      - "8000:8000"
    env_file:
      - ./api-gateway/.env
    depends_on:
      - auth
      - backend
      - pong
      - frontend
    restart: unless-stopped

  backend:
    build: ./backend
    ports:
      - "7000:7000"
    env_file:
      - ./backend/.env
    depends_on:
      - db
    restart: unless-stopped

  auth:
    build: ./auth
    ports:
      - "7001:7001"
    env_file:
      - ./auth/.env
    depends_on:
      - db
    restart: unless-stopped

  pong:
    build: ./pong
    ports:
      - "4000:4000"
    env_file:
      - ./pong/.env
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    env_file:
      - ./frontend/.env
    restart: unless-stopped

volumes:
  db_data:
````

---

### **api-gateway/src/index.js**
````javascript
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

app.use('/auth', createProxyMiddleware({ target: 'http://auth:7001', changeOrigin: true }));
app.use('/api', createProxyMiddleware({ target: 'http://backend:7000', changeOrigin: true }));
app.use('/pong', createProxyMiddleware({ target: 'http://pong:4000', ws: true, changeOrigin: true }));
app.use('/', createProxyMiddleware({ target: 'http://frontend:3000', changeOrigin: true }));

app.listen(8000, () => console.log('API Gateway running on port 8000'));
````

---

### **api-gateway/package.json**
````json
{
  "name": "api-gateway",
  "version": "1.0.0",
  "main": "src/index.js",
  "type": "module",
  "scripts": {
    "start": "node src/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "http-proxy-middleware": "^2.0.6"
  }
}
````

---

### **api-gateway/Dockerfile**
````dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8000
CMD ["node", "src/index.js"]
````

---

### **backend/src/index.ts**
````typescript
import Fastify from 'fastify';
import { Pool } from 'pg';

const fastify = Fastify();
const db = new Pool({ connectionString: process.env.DATABASE_URL });

fastify.get('/api/hello', async (request, reply) => {
  const res = await db.query('SELECT NOW()');
  reply.send({ message: 'Hello from backend!', time: res.rows[0].now });
});

fastify.listen({ port: 7000, host: '0.0.0.0' }, err => {
  if (err) throw err;
  console.log('Backend running on port 7000');
});
````

---

### **backend/package.json**
````json
{
  "name": "backend",
  "version": "1.0.0",
  "main": "dist/index.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts"
  },
  "dependencies": {
    "fastify": "^4.25.0",
    "pg": "^8.11.3"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "ts-node": "^10.9.1",
    "@types/node": "^20.0.0"
  }
}
````

---

### **backend/Dockerfile**
````dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 7000
CMD ["node", "dist/index.js"]
````

---

### **backend/tsconfig.json**
````json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "nodenext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
````

---

### **auth/src/index.ts**
````typescript
import Fastify from 'fastify';
import { Pool } from 'pg';

const fastify = Fastify();
const db = new Pool({ connectionString: process.env.DATABASE_URL });

fastify.post('/auth/login', async (request, reply) => {
  // Your login logic here
  reply.send({ token: 'jwt-token' });
});

fastify.listen({ port: 7001, host: '0.0.0.0' }, err => {
  if (err) throw err;
  console.log('Auth running on port 7001');
});
````

---

### **auth/package.json**
````json
{
  "name": "auth",
  "version": "1.0.0",
  "main": "dist/index.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts"
  },
  "dependencies": {
    "fastify": "^4.25.0",
    "pg": "^8.11.3"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "ts-node": "^10.9.1",
    "@types/node": "^20.0.0"
  }
}
````

---

### **auth/Dockerfile**
````dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 7001
CMD ["node", "dist/index.js"]
````

---

### **auth/tsconfig.json**
````json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "nodenext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
````

---

### **pong/src/index.ts**
````typescript
import Fastify from 'fastify';
import websocket from '@fastify/websocket';

const fastify = Fastify();
fastify.register(websocket);

fastify.get('/pong/ws', { websocket: true }, (connection, req) => {
  connection.socket.on('message', message => {
    connection.socket.send('pong: ' + message);
  });
});

fastify.listen({ port: 4000, host: '0.0.0.0' }, err => {
  if (err) throw err;
  console.log('Pong running on port 4000');
});
````

---

### **pong/package.json**
````json
{
  "name": "pong",
  "version": "1.0.0",
  "main": "dist/index.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts"
  },
  "dependencies": {
    "fastify": "^4.25.0",
    "@fastify/websocket": "^7.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "ts-node": "^10.9.1",
    "@types/node": "^20.0.0"
  }
}
````

---

### **pong/Dockerfile**
````dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["node", "dist/index.js"]
````

---

### **pong/tsconfig.json**
````json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "nodenext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
````

---

### **frontend/public/index.html**
````html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fastify OAuth2 SPA</title>
</head>
<body>
  <div id="app"></div>
  <script src="/main.js"></script>
</body>
</html>
````

---

### **main.ts**
````typescript
function render() {
  const app = document.getElementById('app');
  if (!app) {
    console.error('App element not found');
    return;
  }
  
  switch (window.location.pathname) {
    case '/':
      app.innerHTML = `
        <h1>Welcome to Fastify OAuth2 SPA</h1>
        <a href="/login/google">Login with Google</a>
        <div id="status"></div>
      `;
      checkAuth();
      break;
    case '/login/success':
      app.innerHTML = `
        <h1>Login Successful!</h1>
        <a href="/" onclick="navigate(event, '/')">Go Home</a>
      `;
      checkAuth();
      break;
    case '/login/failure':
      app.innerHTML = `
        <h1>Login Failed!</h1>
        <a href="/" onclick="navigate(event, '/')">Go Home</a>
      `;
      break;
    default:
      app.innerHTML = `<h1>404 Not Found</h1>`;
  }
}

function navigate(event: Event, path: string): void {
  event.preventDefault();
  window.history.pushState({}, '', path);
  render();
}

function checkAuth(): void {
  fetch('/api/me', { credentials: 'include' })
    .then(res => res.ok ? res.json() : null)
    .then(user => {
      const status = document.getElementById('status');
      if (status) {
        if (user && user.email) {
          status.innerHTML = `<p>Logged in as: ${user.email}</p>`;
        } else {
          status.innerHTML = `<p>Not logged in.</p>`;
        }
      }
    });
}

window.onpopstate = render;
window.onload = render;
````

---

### **frontend/package.json**
````json
{
  "name": "frontend",
  "version": "1.0.0",
  "main": "public/main.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "serve -s public -l 3000"
  },
  "dependencies": {
    "serve": "^14.2.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
````

---

### **frontend/Dockerfile**
````dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "public", "-l", "3000"]
````

---

### **frontend/tsconfig.json**
````json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./public"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
````

---

**You can now copy these files into your new structure and build your microservices project!  
Let me know if you want to add authentication logic, database models, or Pong game logic next.**

Similar code found with 1 license type
