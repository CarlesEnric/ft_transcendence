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

---

## **1. Scaffold the Microservices**

Create these folders (one for each service):

- `database/`
- `auth/`
- `server/`
- `pong/`
- `frontend/`
- `api-gateway/`

---

## **2. Move Your Existing Code**

- **Move your SQLite logic** (`db.ts` and table creation) into the new `database` service.
- **Move authentication logic** (`authController.ts`, `oauth2.ts`) into the `auth` service.
- **Move other API/business logic** into the `server` service.
- **Move game logic** into the `pong` service.
- **Move static files** (`index.html`, frontend JS/TS) into `frontend/public/`.

---

## **3. Make the Database Service the Only One Accessing SQLite**

- Only the `database` service should open/read/write the SQLite file.
- All other services (auth, server, pong) should **call the database service via HTTP API** (e.g., REST endpoints like `/users`, `/games`, etc.).

---

## **4. Update Your Services to Use the Database API**

- Replace direct SQLite access in your code with HTTP requests to the `database` service.
  - For example, instead of `db.get(...)`, do `fetch('http://database:6000/users/1')`.

---

## **5. Use Docker Compose to Orchestrate**

- Use the docker-compose.yml as shown in the previous steps to run all services together.
- Each service gets its own Dockerfile, .env, and index.ts.

---

## **6. Keep Your Functionality**

- The **frontend** will still serve your SPA.
- The **auth** service will still handle OAuth2/JWT.
- The **server** will still handle your business logic.
- The **pong** service will handle your game logic.
- The **database** service will handle all SQLite operations.

---

## **7. Example: How to Call the Database Service**

**Old code (direct SQLite):**
```typescript
// old
db.get('SELECT * FROM users WHERE id = ?', [id], ...);
```

**New code (HTTP call):**
```typescript
// new
const user = await fetch('http://database:6000/users/' + id).then(res => res.json());
```

---

## **8. Next Steps**

1. **Scaffold each service** with a basic Fastify/Express app.
2. **Move your code** into the right service.
3. **Refactor DB access** to use HTTP requests to the database service.
4. **Test everything** with Docker Compose.

---


GitHub Copilot: Great! Let’s start with a **sample implementation for the `database` service**.  
This service will expose a simple REST API for user management using SQLite, and you can expand it for other tables as needed.

---

### 1. **Folder Structure**

```
database/
  Dockerfile
  .env
  src/
    index.ts
    db.ts
  package.json
  tsconfig.json
```

---

### 2. **Sample `database/src/db.ts`**

````typescript
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

export async function openDb(): Promise<Database> {
  return open({
    filename: './data/db.sqlite',
    driver: sqlite3.Database
  });
}
````

---

### 3. **Sample `database/src/index.ts`**

````typescript
import Fastify from 'fastify';
import { openDb } from './db';

const fastify = Fastify();
let db: Awaited<ReturnType<typeof openDb>>;

fastify.register(async () => {
  db = await openDb();

  // Ensure users table exists
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    );
  `);

  // Get all users
  fastify.get('/users', async (req, reply) => {
    const users = await db.all('SELECT * FROM users');
    reply.send(users);
  });

  // Get user by id
  fastify.get('/users/:id', async (req, reply) => {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.params['id']]);
    if (user) reply.send(user);
    else reply.status(404).send({ error: 'User not found' });
  });

  // Create user
  fastify.post('/users', async (req, reply) => {
    const { name, email } = req.body as { name: string; email: string };
    try {
      const result = await db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
      reply.send({ id: result.lastID, name, email });
    } catch (err) {
      reply.status(400).send({ error: 'User already exists or invalid data' });
    }
  });
});

fastify.listen({ port: 6000, host: '0.0.0.0' }, (err) => {
  if (err) throw err;
  console.log('Database service running on http://localhost:6000');
});
````

---

### 4. **Sample `database/Dockerfile`**

````dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p ./data
CMD ["npm", "run", "start"]
````

---

### 5. **Sample `database/package.json`**

````json
{
  "name": "database-service",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts"
  },
  "dependencies": {
    "fastify": "^4.25.0",
    "sqlite3": "^5.1.6",
    "sqlite": "^4.2.1"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "ts-node": "^10.9.1"
  }
}
````

---

### 6. **Sample `database/tsconfig.json`**

````json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
````

---

**Next:**  
- Build and run this service (`docker-compose up --build`).
- Update your other microservices to use HTTP requests to `http://database:6000/users` instead of direct SQLite access.



GitHub Copilot: Great! Here’s how to scaffold and migrate your **auth** microservice, so it works with the new architecture and communicates with the `database` service via HTTP.

---

## 1. **Folder Structure**

```
auth/
  Dockerfile
  .env
  package.json
  tsconfig.json
  src/
    index.ts
    oauth2.ts
    authController.ts
```

---

## 2. **Sample `auth/package.json`**

````json
{
  "name": "auth-service",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts"
  },
  "dependencies": {
    "fastify": "^4.25.0",
    "@fastify/jwt": "^7.0.0",
    "@fastify/oauth2": "^7.4.0",
    "node-fetch": "^3.3.2"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "ts-node": "^10.9.1"
  }
}
````

---

## 3. **Sample `auth/tsconfig.json`**

````json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
````

---

## 4. **Sample `auth/Dockerfile`**

````dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "start"]
````

---

## 5. **Sample `auth/.env`**

```
PORT=7001
JWT_SECRET=supersecret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OAUTH2_CALLBACK_URL=http://localhost:7001/login/google/callback
DATABASE_URL=http://database:6000
```

---

## 6. **Sample `auth/src/oauth2.ts`**

````typescript
import { FastifyInstance } from 'fastify';
import oauth2 from '@fastify/oauth2';

export async function oauth2Plugin(fastify: FastifyInstance) {
  fastify.register(oauth2, {
    name: 'googleOAuth2',
    scope: ['profile', 'email'],
    credentials: {
      client: {
        id: process.env.GOOGLE_CLIENT_ID!,
        secret: process.env.GOOGLE_CLIENT_SECRET!
      }
    },
    startRedirectPath: '/login/google',
    callbackUri: process.env.OAUTH2_CALLBACK_URL!,
    discovery: {
      issuer: 'https://accounts.google.com'
    }
  });
}
````

---

## 7. **Sample `auth/src/authController.ts`**

````typescript
import { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.get('/login/google', async (request, reply) => {
    const authorizationUrl = fastify.googleOAuth2.authorizeURL();
    reply.redirect(authorizationUrl);
  });

  fastify.get('/login/google/callback', async (request, reply) => {
    try {
      const token = await fastify.googleOAuth2.getToken(request.query.code as string);
      const userInfo = await fastify.googleOAuth2.getUserInfo(token);

      // Check if user exists in database service
      const dbRes = await fetch(`${process.env.DATABASE_URL}/users?email=${encodeURIComponent(userInfo.email)}`);
      let user = null;
      if (dbRes.ok) {
        const users = await dbRes.json();
        user = users.length > 0 ? users[0] : null;
      }

      // If user doesn't exist, create it
      if (!user) {
        const createRes = await fetch(`${process.env.DATABASE_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: userInfo.name, email: userInfo.email })
        });
        user = await createRes.json();
      }

      // Issue JWT
      const jwtToken = fastify.jwt.sign({ userId: user.id, email: user.email });
      reply.send({ message: 'User logged in', token: jwtToken });
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ error: 'OAuth2 error' });
    }
  });

  // Example: Get current user info from JWT
  fastify.get('/me', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    reply.send({ user: request.user });
  });
}
````

---

## 8. **Sample `auth/src/index.ts`**

````typescript
import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import { oauth2Plugin } from './oauth2';
import { authRoutes } from './authController';

const fastify = Fastify({ logger: true });

fastify.register(jwt, { secret: process.env.JWT_SECRET! });

// JWT authentication decorator
fastify.decorate('authenticate', async function(request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

fastify.register(oauth2Plugin);
fastify.register(authRoutes);

fastify.listen({ port: Number(process.env.PORT) || 7001, host: '0.0.0.0' }, (err) => {
  if (err) throw err;
  console.log('Auth service running on http://localhost:7001');
});
````

---

**How it works:**
- `/login/google` and `/login/google/callback` handle OAuth2 login.
- On callback, the service checks/creates the user via the `database` service API.
- Issues a JWT for the SPA/frontend to use.
- `/me` returns the current user info (JWT-protected).

---

**Next:**  
- Update your `database` service to support `/users?email=...` and `/users` POST.
- Update your frontend to call the new `/me` endpoint on the `auth` service.



GitHub Copilot: Here’s how to scaffold and migrate your **server** microservice, so it works in your new architecture and communicates with the `database` service via HTTP.

---

## 1. **Folder Structure**

```
server/
  Dockerfile
  .env
  package.json
  tsconfig.json
  src/
    index.ts
    apiController.ts
```

---

## 2. **Sample `server/package.json`**

````json
{
  "name": "server-service",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts"
  },
  "dependencies": {
    "fastify": "^4.25.0",
    "node-fetch": "^3.3.2"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "ts-node": "^10.9.1"
  }
}
````

---

## 3. **Sample `server/tsconfig.json`**

````json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
````

---

## 4. **Sample `server/Dockerfile`**

````dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "start"]
````

---

## 5. **Sample `server/.env`**

```
PORT=7000
DATABASE_URL=http://database:6000
```

---

## 6. **Sample `server/src/apiController.ts`**

````typescript
import { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';

export async function apiRoutes(fastify: FastifyInstance) {
  // Example: Get all users (proxy to database service)
  fastify.get('/users', async (request, reply) => {
    const res = await fetch(`${process.env.DATABASE_URL}/users`);
    const users = await res.json();
    reply.send(users);
  });

  // Example: Get user by id
  fastify.get('/users/:id', async (request, reply) => {
    const res = await fetch(`${process.env.DATABASE_URL}/users/${request.params['id']}`);
    if (res.ok) {
      const user = await res.json();
      reply.send(user);
    } else {
      reply.status(404).send({ error: 'User not found' });
    }
  });

  // Add more endpoints as needed, proxying to the database service
}
````

---

## 7. **Sample `server/src/index.ts`**

````typescript
import Fastify from 'fastify';
import { apiRoutes } from './apiController';

const fastify = Fastify({ logger: true });

fastify.register(apiRoutes);

fastify.listen({ port: Number(process.env.PORT) || 7000, host: '0.0.0.0' }, (err) => {
  if (err) throw err;
  console.log('Server service running on http://localhost:7000');
});
````

---

**How it works:**
- The server exposes API endpoints (e.g., `/users`, `/users/:id`).
- For data, it makes HTTP requests to the `database` service.
- You can expand `apiController.ts` with more routes and business logic as needed.

---

GitHub Copilot: Here’s how to scaffold your **frontend** microservice so it fits your new architecture and serves your SPA (Single Page Application) using TypeScript for your frontend logic.

---

## 1. **Folder Structure**

```
frontend/
  Dockerfile
  .env
  package.json
  tsconfig.json
  public/
    index.html
    main.js   # (generated from src/main.ts)
  src/
    main.ts  # (your TypeScript SPA logic)
```

---

## 2. **Sample `frontend/package.json`**

````json
{
  "name": "frontend-service",
  "version": "1.0.0",
  "main": "public/main.js",
  "scripts": {
    "build": "tsc",
    "start": "npx serve public -l 3000",
    "dev": "tsc --watch"
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

## 3. **Sample `frontend/tsconfig.json`**

````json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "ES6",
    "outDir": "./public",
    "rootDir": "./src",
    "strict": true
  },
  "include": ["src/**/*"]
}
````

---

## 4. **Sample `frontend/Dockerfile`**

````dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
````

---

## 5. **Sample `frontend/.env`**

```
PORT=3000
```

---

## 6. **Sample `frontend/public/index.html`**

````html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Fastify OAuth2 SPA</title>
</head>
<body>
  <h1>Welcome to Fastify OAuth2 Example</h1>
  <div id="app"></div>
  <script type="module" src="/main.js"></script>
</body>
</html>
````

---

## 7. **Sample `frontend/src/main.ts`**

````typescript
const app = document.getElementById('app');

async function checkAuth() {
  try {
    const res = await fetch('http://localhost:7001/me', {
      credentials: 'include'
    });
    if (res.ok) {
      const data = await res.json();
      app!.innerHTML = `<p>Logged in as ${data.user.email}</p>`;
    } else {
      app!.innerHTML = `<a href="http://localhost:7001/login/google">Login with Google</a>`;
    }
  } catch {
    app!.innerHTML = `<a href="http://localhost:7001/login/google">Login with Google</a>`;
  }
}

checkAuth();
````

---

## 8. **How to Use**

- Write your frontend logic in `src/main.ts`.
- Run `npm run build` in the `frontend` folder to compile TypeScript to JavaScript (`public/main.js`).
- The Dockerfile uses [`serve`](https://www.npmjs.com/package/serve) to serve static files on port 3000.

---


GitHub Copilot: Here’s how to scaffold your **api-gateway** microservice. This service will act as a reverse proxy, forwarding requests to the correct backend microservice (auth, server, pong, frontend).

---

## 1. **Folder Structure**

```
api-gateway/
  Dockerfile
  .env
  package.json
  tsconfig.json
  src/
    index.ts
```

---

## 2. **Sample `api-gateway/package.json`**

````json
{
  "name": "api-gateway-service",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts"
  },
  "dependencies": {
    "fastify": "^4.25.0",
    "@fastify/http-proxy": "^7.5.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "ts-node": "^10.9.1"
  }
}
````

---

## 3. **Sample `api-gateway/tsconfig.json`**

````json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
````

---

## 4. **Sample `api-gateway/Dockerfile`**

````dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "start"]
````

---

## 5. **Sample `api-gateway/.env`**

```
PORT=8000
```

---

## 6. **Sample `api-gateway/src/index.ts`**

````typescript
import Fastify from 'fastify';
import httpProxy from '@fastify/http-proxy';

const fastify = Fastify({ logger: true });

// Proxy /api/auth/* to auth service
fastify.register(httpProxy, {
  upstream: 'http://auth:7001',
  prefix: '/api/auth',
  rewritePrefix: ''
});

// Proxy /api/game/* to pong service
fastify.register(httpProxy, {
  upstream: 'http://pong:4000',
  prefix: '/api/game',
  rewritePrefix: ''
});

// Proxy /api/* to server service
fastify.register(httpProxy, {
  upstream: 'http://server:7000',
  prefix: '/api',
  rewritePrefix: ''
});

// Proxy / to frontend service (static files)
fastify.register(httpProxy, {
  upstream: 'http://frontend:3000',
  prefix: '/',
  rewritePrefix: '/'
});

fastify.listen({ port: Number(process.env.PORT) || 8000, host: '0.0.0.0' }, (err) => {
  if (err) throw err;
  console.log('API Gateway running on http://localhost:8000');
});
````

---

**How it works:**
- Requests to `/api/auth/*` go to the `auth` service.
- Requests to `/api/game/*` go to the `pong` service.
- Requests to `/api/*` go to the `server` service.
- All other requests (`/`) go to the `frontend` service.

---

You can now access your whole app via `http://localhost:8000` and the gateway will route requests to the correct microservice.


GitHub Copilot: To enable **CORS authentication** (cross-origin requests with credentials, such as cookies or Authorization headers) in your microservices architecture, you need to:

---

### 1. **Enable CORS in Each Service**

Install the CORS plugin for Fastify in each service that will be accessed from the frontend (auth, server, pong, etc.):

```sh
npm install @fastify/cors
```

---

#### **Example: Enable CORS in a Fastify Service**

````typescript
// Add this to the top of your src/index.ts in each service
import cors from '@fastify/cors';

await fastify.register(cors, {
  origin: ['http://localhost:3000', 'http://frontend:3000'], // Adjust as needed
  credentials: true
});
````

- `origin`: List the allowed origins (your frontend URLs).
- `credentials: true`: Allows cookies and Authorization headers to be sent.

---

### 2. **Frontend: Send Credentials**

When making requests from your frontend, always include credentials:

````typescript
// Example fetch with credentials
fetch('http://localhost:8000/api/auth/me', {
  credentials: 'include'
});
````

---

### 3. **API Gateway: Forward Headers**

If you use an API gateway, ensure it forwards authentication headers and cookies.  
With Fastify’s http-proxy, this is handled automatically, but you can add:

````typescript
// In api-gateway/src/index.ts
fastify.register(httpProxy, {
  upstream: 'http://auth:7001',
  prefix: '/api/auth',
  rewritePrefix: '',
  http2: false,
  preHandler: (request, reply, done) => {
    // Forward cookies and auth headers if needed
    done();
  }
});
````

---

### 4. **Summary Checklist**

- [x] Enable CORS with `credentials: true` in all backend services.
- [x] Set `origin` to your frontend’s URL.
- [x] Use `credentials: 'include'` in frontend fetch/XHR.
- [x] Ensure the gateway forwards cookies and headers.

---

GitHub Copilot: Here’s how to scaffold your **pong** (game) microservice so it fits your new architecture and communicates with the `database` service via HTTP.

---

## 1. **Folder Structure**

```
pong/
  Dockerfile
  .env
  package.json
  tsconfig.json
  src/
    index.ts
    pongController.ts
```

---

## 2. **Sample `pong/package.json`**

````json
{
  "name": "pong-service",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts"
  },
  "dependencies": {
    "fastify": "^4.25.0",
    "node-fetch": "^3.3.2",
    "@fastify/websocket": "^7.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "ts-node": "^10.9.1"
  }
}
````

---

## 3. **Sample `pong/tsconfig.json`**

````json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
````

---

## 4. **Sample `pong/Dockerfile`**

````dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "start"]
````

---

## 5. **Sample `pong/.env`**

```
PORT=4000
DATABASE_URL=http://database:6000
```

---

## 6. **Sample `pong/src/pongController.ts`**

````typescript
import { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';

export async function pongRoutes(fastify: FastifyInstance) {
  // Example: Save a game score
  fastify.post('/scores', async (request, reply) => {
    const { userId, score } = request.body as { userId: number; score: number };
    const res = await fetch(`${process.env.DATABASE_URL}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, score })
    });
    const data = await res.json();
    reply.send(data);
  });

  // Example: Get top scores
  fastify.get('/scores', async (request, reply) => {
    const res = await fetch(`${process.env.DATABASE_URL}/scores`);
    const scores = await res.json();
    reply.send(scores);
  });

  // Add more game logic endpoints as needed
}
````

---

## 7. **Sample `pong/src/index.ts`**

````typescript
import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import { pongRoutes } from './pongController';

const fastify = Fastify({ logger: true });

fastify.register(websocket);
fastify.register(pongRoutes);

fastify.listen({ port: Number(process.env.PORT) || 4000, host: '0.0.0.0' }, (err) => {
  if (err) throw err;
  console.log('Pong service running on http://localhost:4000');
});
````

---

**How it works:**
- The pong service exposes endpoints for saving and retrieving scores.
- It communicates with the `database` service via HTTP.
- You can expand it with real-time game logic using websockets.

---

GitHub Copilot: Here’s how to add **score endpoints** to your `database` service so other microservices (like `pong`) can save and retrieve game scores via HTTP.

---

## 1. **Extend the SQLite Schema**

Add a `scores` table to your database initialization:

````typescript
// ...existing code...
await db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
  );
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    score INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(userId) REFERENCES users(id)
  );
`);
// ...existing code...
````

---

## 2. **Add REST Endpoints for Scores**

Add these routes to your Fastify registration in `database/src/index.ts`:

````typescript
// ...existing code...

// Get all scores (optionally filter by userId)
fastify.get('/scores', async (req, reply) => {
  const userId = req.query['userId'];
  let scores;
  if (userId) {
    scores = await db.all('SELECT * FROM scores WHERE userId = ? ORDER BY score DESC', [userId]);
  } else {
    scores = await db.all('SELECT * FROM scores ORDER BY score DESC');
  }
  reply.send(scores);
});

// Get a single score by id
fastify.get('/scores/:id', async (req, reply) => {
  const score = await db.get('SELECT * FROM scores WHERE id = ?', [req.params['id']]);
  if (score) reply.send(score);
  else reply.status(404).send({ error: 'Score not found' });
});

// Create a new score
fastify.post('/scores', async (req, reply) => {
  const { userId, score } = req.body as { userId: number; score: number };
  if (!userId || typeof score !== 'number') {
    return reply.status(400).send({ error: 'userId and score are required' });
  }
  const result = await db.run(
    'INSERT INTO scores (userId, score) VALUES (?, ?)',
    [userId, score]
  );
  const newScore = await db.get('SELECT * FROM scores WHERE id = ?', [result.lastID]);
  reply.send(newScore);
});

// ...existing code...
````

---

## 3. **How to Use from Other Services**

- **Get all scores:**  
  `GET http://database:6000/scores`
- **Get scores for a user:**  
  `GET http://database:6000/scores?userId=123`
- **Get a score by id:**  
  `GET http://database:6000/scores/1`
- **Create a score:**  
  `POST http://database:6000/scores`  
  Body: `{ "userId": 123, "score": 42 }`

---

This will allow your `pong` service (or any other) to save and retrieve scores via HTTP, keeping all SQLite access inside the `database` service.

Let me know if you want a ready-to-use code block for your `pong` service to interact with these endpoints!

CarlesEnric: yes

GitHub Copilot: Perfect! You’re ready to proceed. Here’s a **summary of your next concrete steps**:

---

### 1. **Scaffold Each Service**
- Create the folders and starter files for each microservice as shown above.

### 2. **Move Your Existing Logic**
- Move authentication, business logic, game logic, and static files into their respective services.

### 3. **Refactor DB Access**
- Remove all direct SQLite access from your other services.
- Make all DB operations go through the `database` service’s HTTP API.

### 4. **Test with Docker Compose**
- Use `docker-compose up --build` to start all services.
- Test that each service communicates correctly (e.g., `auth` can create users via `database`, `pong` can save scores, etc.).

---

GitHub Copilot: Here’s how your **pong** service can interact with the new `database` service for scores, using the endpoints you’ve set up:

---

### 1. **Saving a Score**

````typescript
import { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';

export async function pongRoutes(fastify: FastifyInstance) {
  // Save a new score
  fastify.post('/scores', async (request, reply) => {
    const { userId, score } = request.body as { userId: number; score: number };
    const res = await fetch(`${process.env.DATABASE_URL}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, score })
    });
    const data = await res.json();
    reply.send(data);
  });

  // Get all scores
  fastify.get('/scores', async (request, reply) => {
    const res = await fetch(`${process.env.DATABASE_URL}/scores`);
    const scores = await res.json();
    reply.send(scores);
  });

  // Get scores for a specific user
  fastify.get('/scores/user/:userId', async (request, reply) => {
    const userId = request.params['userId'];
    const res = await fetch(`${process.env.DATABASE_URL}/scores?userId=${userId}`);
    const scores = await res.json();
    reply.send(scores);
  });
}
````

---

### 2. **Register the Controller in Your Service**

````typescript
import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import { pongRoutes } from './pongController';

const fastify = Fastify({ logger: true });

fastify.register(websocket);
fastify.register(pongRoutes);

fastify.listen({ port: Number(process.env.PORT) || 4000, host: '0.0.0.0' }, (err) => {
  if (err) throw err;
  console.log('Pong service running on http://localhost:4000');
});
````

---

### 3. **.env Example**

```
PORT=4000
DATABASE_URL=http://database:6000
```

---

---

## **Step-by-Step Migration Checklist**

1. **Scaffold Each Service**
   - Create folders for: `database`, `auth`, `server`, `pong`, `frontend`, `api-gateway`.
   - Add a Dockerfile, .env, package.json, tsconfig.json, and index.ts for each.

2. **Move Existing Logic**
   - Move your SQLite logic (DB connection, table creation, queries) into the `database` service.
   - Move authentication (OAuth2, JWT, user management) into the `auth` service.
   - Move business logic (API endpoints) into the `server` service.
   - Move game logic into the `pong` service.
   - Move static files and SPA logic into `frontend/public/`.

3. **Refactor DB Access**
   - Remove all direct SQLite access from `auth`, `server`, and `pong`.
   - Replace with HTTP requests to the `database` service (e.g., `fetch('http://database:6000/users')`).

4. **Test Communication**
   - Use `docker-compose up --build` to start all services.
   - Test that each service can reach the `database` service via HTTP.

---

## **What to Do Next**

- **Pick a service to start with** (e.g., `database`).
- Scaffold it as shown in previous examples.
- Move and adapt your code for that service.
- Repeat for each service.

---

GitHub Copilot: Here’s a ready-to-use **Pong microservice** that interacts with your `database` service for saving and retrieving scores.  
This example assumes your `database` service exposes `/scores` endpoints as previously described.

---

### 1. **pong/src/pongController.ts**

````typescript
import { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';

export async function pongRoutes(fastify: FastifyInstance) {
  // Save a new score
  fastify.post('/scores', async (request, reply) => {
    const { userId, score } = request.body as { userId: number; score: number };
    const res = await fetch(`${process.env.DATABASE_URL}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, score })
    });
    const data = await res.json();
    reply.send(data);
  });

  // Get all scores
  fastify.get('/scores', async (_request, reply) => {
    const res = await fetch(`${process.env.DATABASE_URL}/scores`);
    const scores = await res.json();
    reply.send(scores);
  });

  // Get scores for a specific user
  fastify.get('/scores/user/:userId', async (request, reply) => {
    const userId = request.params['userId'];
    const res = await fetch(`${process.env.DATABASE_URL}/scores?userId=${userId}`);
    const scores = await res.json();
    reply.send(scores);
  });
}
````

---

### 2. **pong/src/index.ts**

````typescript
import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import { pongRoutes } from './pongController';

const fastify = Fastify({ logger: true });

fastify.register(websocket);
fastify.register(pongRoutes);

fastify.listen({ port: Number(process.env.PORT) || 4000, host: '0.0.0.0' }, (err) => {
  if (err) throw err;
  console.log('Pong service running on http://localhost:4000');
});
````

---

### 3. **pong/.env**

```
PORT=4000
DATABASE_URL=http://database:6000
```

---

### 4. **pong/package.json**

````json
{
  "name": "pong-service",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts"
  },
  "dependencies": {
    "fastify": "^4.25.0",
    "node-fetch": "^3.3.2",
    "@fastify/websocket": "^7.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "ts-node": "^10.9.1"
  }
}
````

---

### 5. **pong/tsconfig.json**

````json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
````

---

### 6. **pong/Dockerfile**

````dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "start"]
````

