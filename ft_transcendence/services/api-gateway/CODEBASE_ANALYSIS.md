# 🔍 ANÀLISI COMPLETA DEL CODI - API GATEWAY

## Índex
1. [Estructura del projecte](#estructura-del-projecte)
2. [package.json - Dependències i scripts](#packagejson---dependències-i-scripts)
3. [tsconfig.json - Configuració TypeScript](#tsconfigjson---configuració-typescript)
4. [Dockerfile - Configuració Docker](#dockerfile---configuració-docker)
5. [server.ts - Creació del servidor](#serverjs---creació-del-servidor)
6. [config/index.ts - Configuració](#configindexts---configuració)
7. [types/index.ts - Definicions de tipus](#typesindexts---definicions-de-tipus)
8. [middleware/index.ts - Middleware](#middlewareindexts---middleware)
9. [routes/health.ts - Health check](#routeshealthts---health-check)
10. [routes/proxy.ts - Proxy per microserveis](#routesproxyts---proxy-per-microserveis)
11. [routes/websocket.ts - WebSocket](#routeswebsocketts---websocket)
12. [utils/index.ts - Utilitats](#utilsindexts---utilitats)
13. [index.ts - Punt d'entrada](#indexts---punt-dentrada)
14. [ssl/ssl.sh - SSL Certificate Generation Script](#sslsslsh---ssl-certificate-generation-script)

---

## Estructura del projecte

```
services/api-gateway/
├── src/
│   ├── config/
│   │   └── index.ts        # Configuració del servei
│   ├── middleware/
│   │   └── index.ts        # Middleware global
│   ├── routes/
│   │   ├── health.ts       # Health check endpoint
│   │   ├── proxy.ts        # Proxy per microserveis
│   │   └── websocket.ts    # WebSocket routes
│   ├── types/
│   │   └── index.ts        # Definicions TypeScript
│   ├── utils/
│   │   └── index.ts        # Utilitats generals
│   ├── server.ts           # Configuració del servidor
│   └── index.ts            # Punt d'entrada
├── ssl/
│   └── ssl.sh              # Script per generar certificats SSL
├── package.json
├── tsconfig.json
├── Dockerfile
├── .dockerignore
├── .env
└── README.md
```

---

## package.json - Dependències i scripts

```json
{
  "name": "api-gateway",
  "version": "1.0.0",
  "description": "API Gateway - Single entry point for all microservices",
  "main": "dist/index.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "clean": "rm -rf dist",
    "type-check": "tsc --noEmit"
  },
  "author": "cteixido, fcosta-f, iassambe, avolcy, aduenas-",
  "license": "MIT",
  "dependencies": {
    "fastify": "^5.4.0",
    "@fastify/cookie": "^11.0.2",
    "@fastify/jwt": "^9.1.0",
    "@fastify/oauth2": "^8.1.2",
    "@fastify/static": "^8.2.0",
    "@fastify/websocket": "^11.1.0",
    "@fastify/cors": "^11.0.1",
    "@fastify/http-proxy": "^11.1.0",
    "@fastify/rate-limit": "^10.3.0",
    "@fastify/helmet": "^13.0.1",
    "node-fetch": "^3.3.2",
    "jwt-decode": "^4.0.0"
  },
  "devDependencies": {
    "typescript": "^5.8.3",
    "ts-node": "^10.9.2",
    "@types/node": "^24.0.1",
    "@types/jwt-decode": "^2.2.1",
    "@types/node-fetch": "^2.6.12"
  }
}
```

### **Anàlisi detallat:**

#### **Línia 1: `{`**
- **Caràcter**: `{` (ASCII 123)
- **Propòsit**: Inicia l'objecte JSON principal
- **Posició**: Primera línia del fitxer

#### **Línia 2: `"name": "api-gateway",`**
- **`"name"`**: Nom del paquet NPM
- **`"api-gateway"`**: Nom específic del servei
- **`,`**: Separador entre propietats JSON
- **Significat**: Identifica el servei com a "api-gateway"

#### **Línia 3: `"version": "1.0.0",`**
- **`"version"`**: Versió del paquet seguint semver
- **`"1.0.0"`**: Versió inicial estable
- **Semver**: Major.Minor.Patch = 1.0.0
- **Significat**: Versió de producció inicial

#### **Línia 4: `"description": "API Gateway - Single entry point for all microservices",`**
- **Funció**: Descripció del servei
- **"Single entry point"**: Punt d'entrada únic
- **"for all microservices"**: Per tots els microserveis
- **Arquitectura**: Patró API Gateway

#### **Línia 5: `"main": "dist/index.js",`**
- **`"main"`**: Punt d'entrada principal
- **`"dist/index.js"`**: Fitxer compilat TypeScript
- **Path**: Relatiu al directori del paquet
- **Propòsit**: Defineix quin fitxer executa Node.js

#### **Línia 6: `"type": "module",`**
- **`"type"`**: Tipus de mòdul
- **`"module"`**: Usa ES6 modules (import/export)
- **Alternativa**: `"commonjs"` (require/module.exports)
- **Beneficis**: Sintaxi moderna, millor tree-shaking

#### **Línia 7-12: Scripts**
```json
"scripts": {
  "build": "tsc",
  "start": "node dist/index.js",
  "dev": "ts-node src/index.ts",
  "clean": "rm -rf dist",
  "type-check": "tsc --noEmit"
}
```

**Anàlisi de cada script:**

##### **`"build": "tsc"`**
- **Comanda**: `tsc` (TypeScript Compiler)
- **Funció**: Compila TypeScript a JavaScript
- **Output**: Genera fitxers a `dist/`
- **Configuració**: Usa `tsconfig.json`

##### **`"start": "node dist/index.js"`**
- **Comanda**: Executa el fitxer compilat
- **Prerequisit**: Necessita `npm run build`
- **Entorn**: Producció
- **Path**: `dist/index.js` (compilat)

##### **`"dev": "ts-node src/index.ts"`**
- **Tool**: `ts-node` (executa TypeScript directament)
- **Fitxer**: `src/index.ts` (codi font)
- **Beneficis**: No cal compilar manualment
- **Entorn**: Desenvolupament

##### **`"clean": "rm -rf dist"`**
- **Comanda**: Elimina directori `dist/`
- **`rm -rf`**: Remove recursive force
- **Propòsit**: Neteja fitxers compilats
- **Quan**: Abans de rebuild

##### **`"type-check": "tsc --noEmit"`**
- **Comanda**: TypeScript sense generar fitxers
- **`--noEmit`**: No genera JavaScript
- **Propòsit**: Només validació de tipus
- **Beneficis**: Ràpid, només errors TypeScript

#### **Línia 13: `"author": "cteixido, fcosta-f, iassambe, avolcy, aduenas-",`**
- **Autors**: Equip de desenvolupadors
- **Format**: Noms separats per comes
- **Propòsit**: Crèdits dels desenvolupadors

#### **Línia 14: `"license": "MIT",`**
- **Llicència**: MIT (permissiva)
- **Permisos**: Ús comercial, modificació, distribució
- **Restriccions**: Mínimes, mantenir copyright

#### **Línia 15-27: Dependencies**
```json
"dependencies": {
  "fastify": "^5.4.0",
  "@fastify/cookie": "^11.0.2",
  "@fastify/jwt": "^9.1.0",
  "@fastify/oauth2": "^8.1.2",
  "@fastify/static": "^8.2.0",
  "@fastify/websocket": "^11.1.0",
  "@fastify/cors": "^11.0.1",
  "@fastify/http-proxy": "^11.1.0",
  "@fastify/rate-limit": "^10.3.0",
  "@fastify/helmet": "^13.0.1",
  "node-fetch": "^3.3.2",
  "jwt-decode": "^4.0.0"
}
```

**Anàlisi de cada dependència:**

##### **`"fastify": "^5.4.0"`**
- **Framework**: Servidor web modern
- **Versió**: 5.4.0 o compatible
- **`^`**: Acepta versions 5.x.x
- **Beneficis**: Rendiment, TypeScript, ecosystem

##### **`"@fastify/cookie": "^11.0.2"`**
- **Plugin**: Gestió de cookies
- **Namespace**: `@fastify/` (oficial)
- **Funció**: Parse/serialize cookies
- **Versió**: 11.0.2 compatible

##### **`"@fastify/jwt": "^9.1.0"`**
- **Plugin**: JSON Web Tokens
- **Funcions**: Sign, verify, decode JWT
- **Integració**: Middleware automàtic
- **Seguretat**: Autenticació sense estat

##### **`"@fastify/oauth2": "^8.1.2"`**
- **Plugin**: OAuth2 integration
- **Providers**: Google, GitHub, etc.
- **Flow**: Authorization code flow
- **Seguretat**: Autenticació externa

##### **`"@fastify/static": "^8.2.0"`**
- **Plugin**: Fitxers estàtics
- **Funció**: Serve CSS, JS, imatges
- **Optimització**: Caching headers
- **Frontend**: Serve SPA

##### **`"@fastify/websocket": "^11.1.0"`**
- **Plugin**: WebSocket support
- **Protocol**: ws:// i wss://
- **Temps real**: Comunicació bidireccional
- **Gaming**: Essencial per jocs

##### **`"@fastify/cors": "^11.0.1"`**
- **Plugin**: Cross-Origin Resource Sharing
- **Seguretat**: Control d'accés origin
- **Frontend**: Permet peticions SPA
- **Configuració**: Origins, methods, headers

##### **`"@fastify/http-proxy": "^11.1.0"`**
- **Plugin**: HTTP proxy/reverse proxy
- **Funció**: Forwarding requests
- **Microserveis**: Routing entre serveis
- **Load balancing**: Distribució càrrega

##### **`"@fastify/rate-limit": "^10.3.0"`**
- **Plugin**: Rate limiting
- **Seguretat**: Prevé spam, DDoS
- **Configuració**: Requests per temps
- **Headers**: X-RateLimit-*

##### **`"@fastify/helmet": "^13.0.1"`**
- **Plugin**: Security headers
- **Headers**: CSP, HSTS, XSS protection
- **Seguretat**: Hardening HTTP
- **Compliment**: Best practices

##### **`"node-fetch": "^3.3.2"`**
- **Library**: HTTP client
- **API**: Fetch API (standard)
- **Versió**: 3.x (ESM only)
- **Ús**: Peticions HTTP externes

##### **`"jwt-decode": "^4.0.0"`**
- **Library**: JWT decoder
- **Funció**: Decode sense validar
- **Ús**: Extraure claims
- **Atenció**: No valida signatures

#### **Línia 28-33: DevDependencies**
```json
"devDependencies": {
  "typescript": "^5.8.3",
  "ts-node": "^10.9.2",
  "@types/node": "^24.0.1",
  "@types/jwt-decode": "^2.2.1",
  "@types/node-fetch": "^2.6.12"
}
```

**Anàlisi de desenvolupament:**

##### **`"typescript": "^5.8.3"`**
- **Compiler**: TypeScript compiler
- **Versió**: 5.8.3 (latest stable)
- **Propòsit**: Transpila TS → JS
- **Beneficis**: Type safety, tooling

##### **`"ts-node": "^10.9.2"`**
- **Tool**: Executa TypeScript directament
- **Configuració**: Registre Node.js
- **Desenvolupament**: Evita compilació manual
- **Performance**: JIT compilation

##### **`"@types/node": "^24.0.1"`**
- **Types**: Definicions TypeScript per Node.js
- **APIs**: fs, path, process, etc.
- **Versió**: 24.x (Node.js 24)
- **Necessari**: Per tipus correctes

##### **`"@types/jwt-decode": "^2.2.1"`**
- **Types**: Definicions per jwt-decode
- **Funcions**: decode() function types
- **Versió**: 2.2.1 compatible
- **TypeScript**: Autocompletions

##### **`"@types/node-fetch": "^2.6.12"`**
- **Types**: Definicions per node-fetch
- **APIs**: fetch(), Response, Request
- **Versió**: 2.x (for node-fetch 2.x)
- **Nota**: Podria ser 3.x per node-fetch 3.x

---

## tsconfig.json - Configuració TypeScript

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "sourceMap": true,
    "removeComments": false,
    "noImplicitAny": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noImplicitReturns": false,
    "noFallthroughCasesInSwitch": false,
    "allowImportingTsExtensions": false,
    "verbatimModuleSyntax": false
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### **Anàlisi detallat:**

#### **Línia 1: `{`**
- **Inici**: Objecte JSON configuració
- **Format**: JSON amb comentaris (jsonc)

#### **Línia 2: `"compilerOptions": {`**
- **Secció**: Opcions del compilador
- **Propòsit**: Configurar comportament tsc

#### **Línia 3: `"target": "ES2022",`**
- **Target**: Versió ECMAScript output
- **ES2022**: Modern JavaScript (2022)
- **Característiques**: Classes, async/await, modules
- **Compatibilitat**: Node.js 16+

#### **Línia 4: `"module": "NodeNext",`**
- **Sistema**: Resolució de mòduls
- **NodeNext**: Node.js ESM modern
- **Beneficis**: Suport complet ESM
- **Compatibilitat**: Node.js 14+

#### **Línia 5: `"moduleResolution": "NodeNext",`**
- **Resolució**: Com buscar mòduls
- **NodeNext**: Algorisme Node.js modern
- **Suport**: ESM i CommonJS
- **Imports**: Correcte .js extensions

#### **Línia 6: `"lib": ["ES2022"],`**
- **Libreries**: APIs disponibles
- **ES2022**: Standard library 2022
- **Inclou**: Promise, Array methods, etc.
- **Exclou**: DOM APIs (no browser)

#### **Línia 7: `"outDir": "./dist",`**
- **Output**: Directori fitxers compilats
- **Path**: `./dist` (relatiu)
- **Estructura**: Manté jerarquia src/
- **Neteja**: Netejat amb npm run clean

#### **Línia 8: `"rootDir": "./src",`**
- **Root**: Directori source files
- **Path**: `./src` (relatiu)
- **Estructura**: Base per imports
- **Organització**: Tots els .ts dins src/

#### **Línia 9: `"strict": true,`**
- **Mode**: Strict type checking
- **Inclou**: Totes les checks estrictes
- **Beneficis**: Menys errors runtime
- **Obligatori**: Millor qualitat codi

#### **Línia 10: `"esModuleInterop": true,`**
- **Interoperabilitat**: ESM ↔ CommonJS
- **Permet**: `import fs from 'fs'`
- **Genera**: Helper functions
- **Compatibilitat**: Libraries mixed

#### **Línia 11: `"allowSyntheticDefaultImports": true,`**
- **Synthetic**: Permite default imports
- **Exemple**: `import React from 'react'`
- **Sense**: Named imports obligatoris
- **Flexibilitat**: Millor DX

#### **Línia 12: `"skipLibCheck": true,`**
- **Skip**: No valida .d.ts files
- **Beneficis**: Compilació més ràpida
- **Risc**: Errors en dependencies
- **Recomanat**: En projectes grans

#### **Línia 13: `"forceConsistentCasingInFileNames": true,`**
- **Casing**: Consistent file names
- **Exemple**: `File.ts` ≠ `file.ts`
- **Sistemas**: macOS/Windows case-insensitive
- **Linux**: Case-sensitive
- **Prevé**: Errors deployment

#### **Línia 14: `"resolveJsonModule": true,`**
- **JSON**: Imports JSON files
- **Exemple**: `import config from './config.json'`
- **Tipus**: Automatic typing
- **Útil**: Configuracions, mock data

#### **Línia 15: `"isolatedModules": true,`**
- **Isolated**: Cada fitxer compilable sol
- **Beneficis**: Millor tooling
- **Restriccions**: Re-exports, const enums
- **Compatibilitat**: Bundlers (Vite, etc.)

#### **Línia 16: `"declaration": true,`**
- **Declarations**: Genera .d.ts files
- **Propòsit**: Type definitions
- **Libreries**: Compartir types
- **Output**: `dist/**/*.d.ts`

#### **Línia 17: `"sourceMap": true,`**
- **Source maps**: Mapeja JS ← TS
- **Debugging**: Mostra codi original
- **Files**: `dist/**/*.js.map`
- **Desenvolupament**: Millor debugging

#### **Línia 18: `"removeComments": false,`**
- **Comentaris**: Manté comentaris
- **JSDoc**: Preserva documentació
- **Beneficis**: Millor debugging
- **Alternativa**: `true` per optimitzar

#### **Línia 19-23: Relaxed checks**
```json
"noImplicitAny": false,
"noUnusedLocals": false,
"noUnusedParameters": false,
"noImplicitReturns": false,
"noFallthroughCasesInSwitch": false,
```

**Anàlisi configuració relaxada:**

##### **`"noImplicitAny": false`**
- **Implicit any**: Permet tipus `any` implícit
- **Beneficis**: Menys errors desenvolupament
- **Desventatge**: Menys type safety
- **Recomanat**: `true` en producció

##### **`"noUnusedLocals": false`**
- **Variables**: Permet variables no usades
- **Desenvolupament**: Útil per testing
- **Producció**: Millor activar
- **Neteja**: Automatitzable

##### **`"noUnusedParameters": false`**
- **Paràmetres**: Permet paràmetres no usats
- **Callbacks**: Útil per function signatures
- **Convención**: Prefix `_` per ignorar
- **Exemple**: `(_req, res) => {}`

##### **`"noImplicitReturns": false`**
- **Returns**: Permet funcions sense return
- **Funcions**: Poden retornar `undefined`
- **Explicite**: Millor marcar void
- **Exemple**: `function log(): void {}`

##### **`"noFallthroughCasesInSwitch": false`**
- **Switch**: Permet fallthrough cases
- **Comportament**: Case sense break
- **Intencionat**: Comentaris clarificant
- **Exemple**: `// fallthrough`

#### **Línies 24-25: Module features**
```json
"allowImportingTsExtensions": false,
"verbatimModuleSyntax": false
```

##### **`"allowImportingTsExtensions": false`**
- **Extensions**: No permet `.ts` en imports
- **Exemple**: `import './file.ts'` ❌
- **Correcte**: `import './file.js'` ✅
- **Motiu**: Runtime usa .js

##### **`"verbatimModuleSyntax": false`**
- **Verbatim**: No força sintaxi exacta
- **Flexibilitat**: Permet type-only imports
- **Exemple**: `import type { Type } from './types'`
- **Optimització**: Millor tree-shaking

#### **Línies 26-28: Files configuration**
```json
"include": ["src/**/*.ts"],
"exclude": ["node_modules", "dist"]
```

##### **`"include": ["src/**/*.ts"]`**
- **Glob**: Tots els .ts dins src/
- **Recursive**: `**` = tots els subdirectoris
- **Específic**: Només fitxers TypeScript
- **Exemple**: `src/routes/health.ts` ✅

##### **`"exclude": ["node_modules", "dist"]`**
- **node_modules**: Dependencies (obviat)
- **dist**: Fitxers compilats
- **Beneficis**: Compilació més ràpida
- **Automàtic**: node_modules sempre exclòs

---

## Dockerfile - Configuració Docker

```dockerfile
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm install

# Copy SSL script and make executable
COPY ssl/ssl.sh ./ssl/ssl.sh
RUN chmod +x ssl/ssl.sh

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port (only service that should be externally accessible)
EXPOSE 3001

# Use SSL script as entrypoint
ENTRYPOINT ["./ssl/ssl.sh"]
CMD ["node", "dist/index.js"]
```

### **Anàlisi detallada:**

#### **Línia 1: `FROM node:24-alpine`**
- **Base image**: Node.js 24 sobre Alpine Linux
- **node:24**: Versió específica Node.js
- **alpine**: Distribució mínima (~5MB)
- **Beneficis**: Seguretat, mida, rendiment
- **Alternativa**: `node:24-slim` (Ubuntu base)

#### **Línia 2: Comentari**
```dockerfile
# Set working directory
```
- **Propòsit**: Documentació del següent command
- **Format**: `#` per comentaris Dockerfile
- **Bona pràctica**: Documenta cada pas

#### **Línia 3: `WORKDIR /app`**
- **Comanda**: Estableix directori de treball
- **Path**: `/app` (absolute path)
- **Efecte**: Tots els commands següents executen aquí
- **Crea**: Directori si no existeix

#### **Línia 4: Comentari**
```dockerfile
# Install system dependencies
```
- **Context**: Dependències del sistema operatiu
- **Necessitat**: SSL certificates, tools

#### **Línia 5: `RUN apk add --no-cache openssl`**
- **apk**: Alpine package manager
- **add**: Installa paquets
- **--no-cache**: No guarda cache local
- **openssl**: Llibreria SSL/TLS
- **Propòsit**: Generar certificats SSL

#### **Línia 6: Comentari**
```dockerfile
# Copy package files
```
- **Estratègia**: Copia package.json primer
- **Benefici**: Millor Docker layer caching
- **Lògica**: Dependencies canvien menys

#### **Línia 7: `COPY package*.json ./`**
- **COPY**: Copia fitxers host → container
- **package*.json**: package.json + package-lock.json
- **`*`**: Wildcard per ambdós fitxers
- **`./`**: Directori actual (/app)

#### **Línia 8: Comentari**
```dockerfile
# Install dependencies (including dev dependencies for build)
```
- **Estratègia**: Inclou devDependencies
- **Motiu**: Necessari per build TypeScript
- **Alternativa**: Multi-stage build

#### **Línia 9: `RUN npm install`**
- **npm install**: Installa totes les dependencies
- **Inclou**: dependencies + devDependencies
- **Genera**: node_modules/
- **Lock file**: Usa package-lock.json

#### **Línia 10: Comentari**
```dockerfile
# Install dependencies only for production, not iclude like typescript dependency
#RUN npm install --production
```
- **Comentat**: Línia alternativa
- **--production**: Només runtime dependencies
- **Motiu**: Necessitem TypeScript per build
- **Typo**: "iclude" → "include"

#### **Línia 11: Comentari**
```dockerfile
# Copy SSL script and make executable
```
- **SSL**: Certificats autosignats
- **Script**: ssl/ssl.sh
- **Executable**: Permisos execució

#### **Línia 12: `COPY ssl/ssl.sh ./ssl/ssl.sh`**
- **Source**: ssl/ssl.sh (host)
- **Dest**: ./ssl/ssl.sh (container)
- **Estructura**: Manté jerarquia
- **Propòsit**: Script generar certificats

#### **Línia 13: `RUN chmod +x ssl/ssl.sh`**
- **chmod**: Canvia permisos
- **+x**: Afegeix permís execució
- **Necessari**: Scripts necessiten +x
- **Octal**: Equivalent a 755

#### **Línia 14: Comentari**
```dockerfile
# Copy source code
```
- **Estratègia**: Copia codi després dependencies
- **Benefici**: Millor caching layers
- **Ordre**: package.json → npm install → source

#### **Línia 15: `COPY . .`**
- **Source**: `.` (directori host actual)
- **Dest**: `.` (directori container actual /app)
- **Inclou**: Tot el codi source
- **Exclou**: Fitxers en .dockerignore

#### **Línia 16: Comentari**
```dockerfile
# Build TypeScript
```
- **Compilació**: TypeScript → JavaScript
- **Necessari**: Runtime Node.js no entén TS

#### **Línia 17: `RUN npm run build`**
- **Script**: Definit en package.json
- **Comanda**: `tsc` (TypeScript compiler)
- **Input**: src/**/*.ts
- **Output**: dist/**/*.js

#### **Línia 18: Comentari**
```dockerfile
# Expose port (only service that should be externally accessible)
```
- **Port**: 3001 (no és el port real)
- **Accessible**: Només API Gateway extern
- **Altres**: Microserveis interns

#### **Línia 19: `EXPOSE 3001`**
- **Instrucció**: Documenta port
- **Port**: 3001 (però usa 443 realment)
- **Efecte**: Només documentació
- **Docker**: No publica automàticament

#### **Línia 20: Comentari**
```dockerfile
# Use SSL script as entrypoint
```
- **Entrypoint**: Primer command executat
- **SSL**: Genera certificats abans servidor
- **Ordre**: SSL → servidor

#### **Línia 21: `ENTRYPOINT ["./ssl/ssl.sh"]`**
- **Format**: JSON array (exec form)
- **Script**: ssl/ssl.sh
- **Executa**: Abans de CMD
- **Propòsit**: Setup SSL certificates

#### **Línia 22: `CMD ["node", "dist/index.js"]`**
- **Command**: Executa després ENTRYPOINT
- **node**: Runtime Node.js
- **dist/index.js**: Fitxer compilat
- **Combinació**: ssl/ssl.sh + node dist/index.js

---

## server.ts - Creació del servidor

```typescript
/**
 * Server factory for creating and configuring the Fastify instance
 * Handles server creation with SSL and logging configuration
 */

import fastify from 'fastify';
import fs from 'fs';
import { AppConfig } from './config/index.js';
import { ServerInstance } from './types/index.js';

/**
 * Create a Fastify server instance with proper configuration
 */
export const createServer = (config: AppConfig): ServerInstance => {
  const serverOptions: any = {
    logger: {
      level: config.nodeEnv === 'production' ? 'info' : 'debug'
    }
  };

  // Add HTTPS configuration if SSL is enabled
  if (config.ssl.enabled && 
      fs.existsSync(config.ssl.keyPath) && 
      fs.existsSync(config.ssl.certPath)) {
    serverOptions.https = {
      key: fs.readFileSync(config.ssl.keyPath),
      cert: fs.readFileSync(config.ssl.certPath)
    };
  }

  return fastify(serverOptions) as any;
};

/**
 * Create a simple HTTP server that redirects all traffic to HTTPS
 */
export const createRedirectServer = (config: AppConfig): ServerInstance => {
  const redirectServer = fastify({
    logger: {
      level: config.nodeEnv === 'production' ? 'info' : 'debug'
    }
  }) as any;

  // Add a catch-all route that redirects all HTTP traffic to HTTPS
  redirectServer.route({
    method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    url: '*',
    handler: async (request: any, reply: any) => {
      const host = request.headers.host || 'localhost';
      const httpsUrl = `https://${host}${request.url}`;
      
      redirectServer.log.info(`HTTP -> HTTPS redirect: ${request.method} ${request.url} -> ${httpsUrl}`);
      return reply.redirect(httpsUrl, 301);
    }
  });

  return redirectServer;
};
```

### **Anàlisi detallada:**

#### **Línies 1-3: Comentari de documentació**
```typescript
/**
 * Server factory for creating and configuring the Fastify instance
 * Handles server creation with SSL and logging configuration
 */
```

**Anàlisi caràcter per caràcter:**

##### **`/**`**
- **Caràcters**: `/` (ASCII 47), `*` (ASCII 42), `*` (ASCII 42)
- **Propòsit**: Inicia comentari de documentació JSDoc
- **Diferència**: `//` = línia única, `/* */` = bloc, `/** */` = JSDoc

##### **` * Server factory for creating and configuring the Fastify instance`**
- **Propòsit**: "Server factory" - Patró Factory
- **Especifica**: "Fastify instance" - Especifica framework

##### **` * Handles server creation with SSL and logging configuration`**
- **Funcions**: 
  - Server creation
  - SSL configuration
  - Logging configuration
- **Responsabilitats**: Separació clara

##### **` */`**
- **Tancament**: `*` (ASCII 42), `/` (ASCII 47)
- **Finalitza**: Comentari JSDoc

#### **Línies 5-7: Imports**
```typescript
import fastify from 'fastify';
import fs from 'fs';
import { AppConfig } from './config/index.js';
import { ServerInstance } from './types/index.js';
```

**Anàlisi de cada import:**

##### **`import fastify from 'fastify';`**
- **Keyword**: `import` (ES6 modules)
- **Default**: `fastify` (función principal)
- **From**: `'fastify'` (npm package)
- **Semicolon**: `;` (opcional en TS, però recomanat)

##### **`import fs from 'fs';`**
- **Module**: `fs` (Node.js file system)
- **Ús**: Llegir certificats SSL
- **Funcions**: `existsSync()`, `readFileSync()`
- **Synchronous**: Bloquejant però OK per configuració

##### **`import { AppConfig } from './config/index.js';`**
- **Named import**: `AppConfig` (interfície)
- **Path**: `./config/index.js` (relatiu)
- **Extension**: `.js` (obligatori en ESM)
- **Propòsit**: Interfície configuració

##### **`import { ServerInstance } from './types/index.js';`**
- **Type**: Definició TypeScript
- **Interfície**: Server instance abstraction
- **Separació**: Types en fitxer separate

#### **Línies 9-11: Comentari funció**
```typescript
/**
 * Create a Fastify server instance with proper configuration
 */
```

**Documentació:**
- **Propòsit**: Crear instància servidor
- **"proper configuration"**: Configuració correcta
- **JSDoc**: Documentació extractable

#### **Línia 12: Definició funció**
```typescript
export const createServer = (config: AppConfig): ServerInstance => {
```

**Anàlisi caràcter per caràcter:**

##### **`export`**
- **Keyword**: Exporta per altres mòduls
- **Caràcters**: `export` (6 caràcters)
- **Propòsit**: Funció disponible externament

##### **` const`**
- **Espai**: Separador (ASCII 32)
- **Keyword**: `const` (immutable binding)
- **Alternativa**: `let`, `var`
- **Millor**: `const` per funcions

##### **` createServer`**
- **Nom**: Camel case
- **Verb**: `create` (acció)
- **Noun**: `Server` (què crea)
- **Convencions**: Nom descriptiu

##### **` =`**
- **Espai**: Separador
- **Operator**: `=` (assignment)
- **Espai**: Separador després

##### **` (`**
- **Espai**: Separador
- **Parenthesis**: `(` inicia paràmetres
- **Function**: Arrow function syntax

##### **`config: AppConfig`**
- **Parameter**: `config` (nom)
- **Colon**: `:` (type annotation)
- **Type**: `AppConfig` (interfície)
- **Propòsit**: Configuració tipada

##### **`): ServerInstance`**
- **Parenthesis**: `)` tanca paràmetres
- **Colon**: `:` (return type)
- **Type**: `ServerInstance` (interfície)
- **Propòsit**: Tipus retorn

##### **` =>`**
- **Espai**: Separador
- **Arrow**: `=>` (arrow function)
- **Espai**: Separador després

##### **` {`**
- **Espai**: Separador
- **Brace**: `{` inicia bloc

#### **Línies 13-17: Configuració servidor**
```typescript
  const serverOptions: any = {
    logger: {
      level: config.nodeEnv === 'production' ? 'info' : 'debug'
    }
  };
```

**Anàlisi detallada:**

##### **Línia 13: `const serverOptions: any = {`**
- **Indent**: 2 espais (convencions)
- **Const**: Immutable reference
- **Nom**: `serverOptions` (descriptiu)
- **Type**: `any` (evitar conflictes Fastify)
- **Problema**: `any` menys type safety
- **Motiu**: Fastify types complexos que canvien

##### **Línia 14: `logger: {`**
- **Propietat**: `logger` (configuració log)
- **Object**: `{` inicia configuració

##### **Línia 15: `level: config.nodeEnv === 'production' ? 'info' : 'debug'`**
- **Property**: `level` - Nivell log
- **Ternary**: `? :` (conditional operator)
- **Condition**: `config.nodeEnv === 'production'`
- **True**: `'info'` (menys detallat)
- **False**: `'debug'` (més detallat)
- **Lògica**: Producció → menys logs

#### **Línies 19-26: Configuració SSL**
```typescript
  // Add HTTPS configuration if SSL is enabled
  if (config.ssl.enabled && 
      fs.existsSync(config.ssl.keyPath) && 
      fs.existsSync(config.ssl.certPath)) {
    serverOptions.https = {
      key: fs.readFileSync(config.ssl.keyPath),
      cert: fs.readFileSync(config.ssl.certPath)
    };
  }
```

**Anàlisi detallada:**

##### **Línia 19: Comentari**
```typescript
  // Add HTTPS configuration if SSL is enabled
```
- **Double slash**: `//` (single line comment)
- **Descripció**: Explica propòsit codi
- **Context**: Configuració HTTPS condicionada

##### **Línia 20: `if (config.ssl.enabled &&`**
- **Keyword**: `if` (conditional)
- **Parenthesis**: `(` inicia condició
- **Access**: `config.ssl.enabled` (nested property)
- **Operator**: `&&` (logical AND)
- **Continua**: Línea següent

##### **Línia 21: `fs.existsSync(config.ssl.keyPath) &&`**
- **Indent**: 6 espais (alignment)
- **Function**: `fs.existsSync()` (sync file check)
- **Parameter**: `config.ssl.keyPath` (path clau)
- **Operator**: `&&` (logical AND)
- **Propòsit**: Verificar existència fitxer

##### **Línia 22: `fs.existsSync(config.ssl.certPath)) {`**
- **Function**: `fs.existsSync()` (sync file check)
- **Parameter**: `config.ssl.certPath` (path certificat)
- **Parenthesis**: `)` tanca condició
- **Brace**: `{` inicia bloc if

##### **Línia 23: `serverOptions.https = {`**
- **Indent**: 4 espais (dins if)
- **Assignment**: `serverOptions.https = ...`
- **Property**: `https` (configuració HTTPS)
- **Object**: `{` inicia configuració

##### **Línia 24: `key: fs.readFileSync(config.ssl.keyPath),`**
- **Property**: `key` (clau privada)
- **Function**: `fs.readFileSync()` (sync read)
- **Parameter**: `config.ssl.keyPath` (path fitxer)
- **Comma**: `,` (separador propietats)

##### **Línia 25: `cert: fs.readFileSync(config.ssl.certPath)`**
- **Property**: `cert` (certificat públic)
- **Function**: `fs.readFileSync()` (sync read)
- **Parameter**: `config.ssl.certPath` (path certificat)
- **No comma**: Última propietat

##### **Línia 26-27: Tancament**
```typescript
    };
  }
```
- **Línia 26**: `};` tanca object https
- **Línia 27**: `}` tanca bloc if

#### **Línies 29-32: Return statement**
```typescript
  return fastify(serverOptions) as any;
};
```

**Anàlisi detallada:**

##### **Línia 29: `return fastify(serverOptions) as any;`**
- **Keyword**: `return` (retorna valor)
- **Function**: `fastify()` (crea instància)
- **Parameter**: `serverOptions` (configuració)
- **Cast**: `as any` (type assertion)
- **Propòsit**: Evitar conflictes tipus
- **Problema**: Perd type safety

##### **Línia 30: `};`**
- **Brace**: `}` tanca funció
- **Semicolon**: `;` tanca declaració const

#### **Línies 33-35: Comentari segona funció**
```typescript
/**
 * Create a simple HTTP server that redirects all traffic to HTTPS
 */
```

**Documentació:**
- **Propòsit**: Servidor HTTP redirect
- **"all traffic"**: Redirigeix tot el tràfic
- **"to HTTPS"**: Redirigeix a HTTPS
- **Patró**: HTTP → HTTPS redirection

#### **Línia 36: Definició segona funció**
```typescript
export const createRedirectServer = (config: AppConfig): ServerInstance => {
```

**Anàlisi:**
- **Estructura**: Igual que primera funció
- **Nom**: `createRedirectServer` (més específic)
- **Propòsit**: Servidor redirect HTTP → HTTPS

#### **Línies 37-41: Configuració redirect server**
```typescript
  const redirectServer = fastify({
    logger: {
      level: config.nodeEnv === 'production' ? 'info' : 'debug'
    }
  }) as any;
```

**Anàlisi:**
- **Variable**: `redirectServer` (nom específic)
- **Configuració**: Igual que servidor principal
- **Diferència**: Sense SSL (HTTP server)

#### **Línies 43-53: Route configuration**
```typescript
  // Add a catch-all route that redirects all HTTP traffic to HTTPS
  redirectServer.route({
    method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    url: '*',
    handler: async (request: any, reply: any) => {
      const host = request.headers.host || 'localhost';
      const httpsUrl = `https://${host}${request.url}`;
      
      redirectServer.log.info(`HTTP -> HTTPS redirect: ${request.method} ${request.url} -> ${httpsUrl}`);
      return reply.redirect(httpsUrl, 301);
    }
  });
```

**Anàlisi detallada:**

##### **Línia 43: Comentari**
```typescript
  // Add a catch-all route that redirects all HTTP traffic to HTTPS
```
- **Double slash**: `//` (single line comment)
- **Descripció**: Explica propòsit codi
- **Context**: Redirecció HTTP → HTTPS

##### **Línia 44: `redirectServer.route({`**
- **Method**: `route()` (definir ruta)
- **Object**: `{` configuració ruta

##### **Línia 45: `method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],`**
- **Property**: `method` (mètodes HTTP)
- **Array**: `[...]` (múltiples mètodes)
- **Mètodes**: Tots els mètodes HTTP principals
- **Propòsit**: Capturar qualsevol mètode

##### **Línia 46: `url: '*',`**
- **Property**: `url` (pattern URL)
- **Wildcard**: `'*'` (qualsevol URL)
- **Propòsit**: Catch-all pattern

##### **Línia 47: `handler: async (request: any, reply: any) => {`**
- **Property**: `handler` (funció manegar)
- **Async**: `async` (funció asíncrona)
- **Parameters**:
  - **request**: `any` (tipus genèric)
  - **reply**: `any` (tipus genèric)

##### **Línia 48: `const host = request.headers.host || 'localhost';`**
- **Const**: Variable local
- **Access**: `request.headers.host` (header Host)
- **Fallback**: `|| 'localhost'` (valor defecte)
- **Propòsit**: Construir URL destí

##### **Línia 49: `const httpsUrl = `https://${host}${request.url}`;`**
- **Template literal**: Backticks `` ` ``
- **Interpolation**: `${host}` i `${request.url}`
- **Protocol**: `https://` (forçar HTTPS)
- **Construcció**: URL completa destí

##### **Línia 50: Línia buida**
- **Espai**: Separar lògica
- **Llegibilitat**: Millor organització

##### **Línia 51: Log statement**
```typescript
redirectServer.log.info(`HTTP -> HTTPS redirect: ${request.method} ${request.url} -> ${httpsUrl}`);
```
- **Logger**: `redirectServer.log.info()`
- **Level**: `info` (informació)
- **Message**: Template literal amb interpolació
- **Format**: `METHOD URL -> HTTPS_URL`

##### **Línia 52: `return reply.redirect(httpsUrl, 301);`**
- **Return**: Retorna resposta
- **Method**: `reply.redirect()` (HTTP redirect)
- **URL**: `httpsUrl` (destinació)
- **Code**: `301` (Moved Permanently)
- **Propòsit**: Redirect permanent HTTP → HTTPS

##### **Línies 53-54: Tancament**
```typescript
    }
  });
```
- **Línia 53**: `}` tanca handler
- **Línia 54**: `});` tanca route() i ;

##### **Línia 56: `return redirectServer;`**
- **Return**: Retorna instància servidor
- **Variable**: `redirectServer` (configurat)

##### **Línia 57: `};`**
- **Brace**: `}` tanca funció
- **Semicolon**: `;` tanca declaració const

---

## config/index.ts - Configuració

```typescript
/**
 * Configuration settings for the API Gateway
 * Centralizes all environment variable handling
 */

export interface ServiceConfig {
  auth: string;
  user: string;
  game: string;
  match: string;
  notification: string;
}

export interface AppConfig {
  port: number;
  host: string;
  nodeEnv: string;
  ssl: {
    enabled: boolean;
    keyPath: string;
    certPath: string;
  };
  services: ServiceConfig;
  frontend: {
    url: string;
    staticPath: string;
  };
  rateLimit: {
    max: number;
    timeWindow: number;
  };
  cors: {
    origin: string;
    methods: string[];
    credentials: boolean;
  };
}

/**
 * Load and validate configuration from environment variables
 */
export const loadConfig = (): AppConfig => {
  return {
    port: parseInt(process.env.PORT || '443', 10),
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
    
    ssl: {
      enabled: process.env.SSL_ENABLED === 'true',
      keyPath: process.env.SSL_KEY_PATH || '/app/ssl/key.pem',
      certPath: process.env.SSL_CERT_PATH || '/app/ssl/cert.pem',
    },
    
    services: {
      auth: process.env.AUTH_SERVICE_URL || 'https://auth:443',
      user: process.env.USER_SERVICE_URL || 'https://user:443',
      game: process.env.GAME_SERVICE_URL || 'https://game:443',
      match: process.env.MATCH_SERVICE_URL || 'https://match:443',
      notification: process.env.NOTIFICATION_SERVICE_URL || 'https://notification:443',
    },
    
    frontend: {
      url: process.env.FRONTEND_URL || 'https://localhost:443',
      staticPath: '/app/frontend',
    },
    
    rateLimit: {
      max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
      timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10),
    },
    
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: (process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,OPTIONS,PATCH').split(','),
      credentials: process.env.CORS_CREDENTIALS === 'true',
    },
  };
};

export const config = loadConfig();
```

### **Anàlisi detallada:**

#### **Línies 1-3: Comentari de documentació**
```typescript
/**
 * Configuration settings for the API Gateway
 * Centralizes all environment variable handling
 */
```

**Anàlisi caràcter per caràcter:**

##### **`/**`**
- **Inici**: Comentari de documentació JSDoc
- **Caràcters**: `/` (ASCII 47), `*` (ASCII 42), `*` (ASCII 42)

##### **` * Configuration settings for the API Gateway`**
- **Propòsit**: "Configuration settings" - Configuració
- **Específic**: "for the API Gateway" - Per aquest servei
- **Funcionalitat**: Abstracció de tipus

##### **` * Centralizes all environment variable handling`**
- **Funció**: "Centralizes" - Centralitza tot
- **Scope**: "all environment variable handling" - Gestió vars entorn
- **Propòsit**: Punt únic per configuració

##### **` */`**
- **Tancament**: `*` (ASCII 42), `/` (ASCII 47)
- **Finalitza**: Comentari JSDoc

#### **Línies 5-11: Interfície ServiceConfig**
```typescript
export interface ServiceConfig {
  auth: string;
  user: string;
  game: string;
  match: string;
  notification: string;
}
```

**Anàlisi detallada:**

##### **`export interface ServiceConfig {`**
- **export**: Disponible altres mòduls
- **interface**: Definició contracte
- **ServiceConfig**: Nom interfície (PascalCase)
- **Brace**: `{` inicia definició

##### **`  auth: string;`**
- **Propietat**: `auth` - Nom propietat
- **Colon**: `:` (ASCII 58) - Separador tipus
- **Espai**: (ASCII 32) - Separador
- **Type**: `string` - Tipus primitiu
- **Semicolon**: `;` (ASCII 59) - Finalitza declaració

##### **`  user: string;`**
- **Estructura**: Idèntica a auth
- **Propòsit**: URL servei usuaris

##### **`  game: string;`**
- **Propòsit**: URL servei jocs

##### **`  match: string;`**
- **Propòsit**: URL servei matches

##### **`  notification: string;`**
- **Propòsit**: URL servei notificacions

##### **`}`**
- **Brace**: `}` (ASCII 125) - Tanca interfície

#### **Línies 13-37: Interfície AppConfig**
```typescript
export interface AppConfig {
  port: number;
  host: string;
  nodeEnv: string;
  ssl: {
    enabled: boolean;
    keyPath: string;
    certPath: string;
  };
  services: ServiceConfig;
  frontend: {
    url: string;
    staticPath: string;
  };
  rateLimit: {
    max: number;
    timeWindow: number;
  };
  cors: {
    origin: string;
    methods: string[];
    credentials: boolean;
  };
}
```

**Anàlisi detallada:**

##### **`export interface AppConfig {`**
- **export**: Disponible altres mòduls
- **interface**: Definició contracte
- **AppConfig**: Nom interfície (PascalCase)
- **Brace**: `{` inicia definició

##### **`  port: number;`**
- **Propietat**: `port` - Nom del port
- **Colon**: `:` (ASCII 58) - Separador tipus
- **Espai**: (ASCII 32) - Separador
- **Type**: `number` - Tipus primitiu numèric
- **Semicolon**: `;` (ASCII 59) - Finalitza declaració

##### **`  host: string;`**
- **Propietat**: `host` - IP bind
- **Colon**: `:` (ASCII 58) - Separador tipus
- **Espai**: (ASCII 32) - Separador
- **Type**: `string` - Cadena text
- **Semicolon**: `;` (ASCII 59) - Finalitza declaració

##### **`  nodeEnv: string;`**
- **Propietat**: `nodeEnv` - Entorn Node.js
- **Colon**: `:` (ASCII 58) - Separador tipus
- **Espai**: (ASCII 32) - Separador
- **Type**: `string` - Cadena text
- **Semicolon**: `;` (ASCII 59) - Finalitza declaració

##### **`  ssl: {`**
- **Propietat**: `ssl` - Configuració SSL
- **Colon**: `:` (ASCII 58) - Separador tipus
- **Espai**: (ASCII 32) - Separador
- **Tipus**: Object literal inline
- **Brace**: `{` inicia objecte nested

##### **`    enabled: boolean;`**
- **Indent**: 4 espais (nested dins ssl)
- **Propietat**: `enabled` - SSL activat
- **Colon**: `:` (ASCII 58) - Separador tipus
- **Espai**: (ASCII 32) - Separador
- **Type**: `boolean` - true/false
- **Semicolon**: `;` (ASCII 59) - Finalitza declaració

##### **`    keyPath: string;`**
- **Propietat**: `keyPath` - Path clau privada
- **Colon**: `:` (ASCII 58) - Separador tipus
- **Espai**: (ASCII 32) - Separador
- **Type**: `string` - Ruta fitxer
- **Semicolon**: `;` (ASCII 59) - Finalitza declaració

##### **`    certPath: string;`**
- **Propietat**: `certPath` - Path certificat
- **Colon**: `:` (ASCII 58) - Separador tipus
- **Espai**: (ASCII 32) - Separador
- **Type**: `string` - Ruta fitxer
- **Semicolon**: `;` (ASCII 59) - Finalitza declaració

##### **`  };`**
- **Brace**: `}` tanca objecte ssl
- **Semicolon**: `;` finalitza propietat

##### **`  services: ServiceConfig;`**
- **Propietat**: `services` - URLs microserveis
- **Colon**: `:` (ASCII 58) - Separador tipus
- **Espai**: (ASCII 32) - Separador
- **Type**: `ServiceConfig` - Interfície definida abans
- **Semicolon**: `;` (ASCII 59) - Finalitza declaració

##### **`  frontend: {`**
- **Propietat**: `frontend` - Configuració frontend
- **Colon**: `:` (ASCII 58) - Separador tipus
- **Espai**: (ASCII 32) - Separador
- **Tipus**: Object literal inline
- **Brace**: `{` inicia objecte nested

##### **`    url: string;`**
- **Propietat**: `url` - URL frontend
- **Colon**: `:` (ASCII 58) - Separador tipus
- **Espai**: (ASCII 32) - Separador
- **Type**: `string` - Cadena text
- **Semicolon**: `;` (ASCII 59) - Finalitza declaració

##### **`    staticPath: string;`**
- **Propietat**: `staticPath` - Path fitxers estàtics
- **Colon**: `:` (ASCII 58) - Separador tipus
- **Espai**: (ASCII 32) - Separador
- **Type**: `string` - Ruta directori
- **Semicolon**: `;` (ASCII 59) - Finalitza declaració

##### **`  };`**
- **Brace**: `}` tanca objecte frontend
- **Semicolon**: `;` finalitza propietat

##### **`  rateLimit: {`**
- **Propietat**: `rateLimit` - Configuració limits
- **Colon**: `:` (ASCII 58) - Separador tipus
- **Espai**: (ASCII 32) - Separador
- **Tipus**: Object literal inline
- **Brace**: `{` inicia objecte nested

##### **`    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),`**
- **Propietat**: `max` - Màxim requests
- **Colon**: `:` (ASCII 58) - Separador tipus
- **Espai**: (ASCII 32) - Separador
- **Function**: `parseInt()` - String → number
- **Parameter 1**: `process.env.RATE_LIMIT_MAX || '100'`
  - **process.env.RATE_LIMIT_MAX**: Variable d'entorn
  - **||**: Logical OR (fallback)
  - **'100'**: Valor per defecte
- **Parameter 2**: `10` - Base decimal
- **Semicolon**: `;` (ASCII 59) - Finalitza declaració

##### **`    timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10),`**
- **Propietat**: `timeWindow` - Finestra temps
- **Colon**: `:` (ASCII 58) - Separador tipus
- **Espai**: (ASCII 32) - Separador
- **Function**: `parseInt()` - String → number
- **Parameter 1**: `process.env.RATE_LIMIT_WINDOW || '60000'`
  - **process.env.RATE_LIMIT_WINDOW**: Variable d'entorn
  - **||**: Logical OR (fallback)
  - **'60000'**: Valor per defecte (60 segons)
- **Parameter 2**: `10` - Base decimal
- **Semicolon**: `;` (ASCII 59) - Finalitza declaració

##### **`  };`**
- **Brace**: `}` tanca objecte rateLimit
- **Semicolon**: `;` finalitza propietat

##### **`  cors: {`**
- **Propietat**: `cors` - Configuració CORS
- **Colon**: `:` (ASCII 58) - Separador tipus
- **Espai**: (ASCII 32) - Separador
- **Tipus**: Object literal inline
- **Brace**: `{` inicia objecte nested

##### **`    origin: process.env.CORS_ORIGIN || '*',`**
- **Propietat**: `origin` - Origins permesos
- **Colon**: `:` (ASCII 58) - Separador tipus
- **Espai**: (ASCII 32) - Separador
- **process.env.CORS_ORIGIN**: Variable d'entorn
- **Fallback**: `'*'` - Tots els origins
- **Seguretat**: `*` és permissiu (desenvolupament)

##### **`    methods: (process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,OPTIONS,PATCH').split(','),`**
- **Propietat**: `methods` - Mètodes HTTP permesos
- **Colon**: `:` (ASCII 58) - Separador tipus
- **Espai**: (ASCII 32) - Separador
- **Parenthesis**: `()` agrupa expressió
- **process.env.CORS_METHODS**: Variable d'entorn
- **Fallback**: `'GET,POST,PUT,DELETE,OPTIONS,PATCH'` - Mètodes comuns
- **Function**: `.split(',')` - Separa per comes
- **Resultat**: Array de strings

##### **`    credentials: process.env.CORS_CREDENTIALS === 'true',`**
- **Propietat**: `credentials` - Inclou cookies
- **Colon**: `:` (ASCII 58) - Separador tipus
- **Espai**: (ASCII 32) - Separador
- **process.env.CORS_CREDENTIALS**: Variable d'entorn
- **Fallback**: `=== 'true'` - Comparació estricta
- **Resultat**: boolean
- **Significat**: Permet cookies en CORS

##### **`  };`**
- **Brace**: `}` tanca objecte cors
- **Semicolon**: `;` finalitza propietat

#### **Línies 77-78: Tancament funció**
```typescript
  };
};
```

**Anàlisi:**
- **Línia 77**: `};` tanca objecte return
- **Línia 78**: `};` tanca funció loadConfig

---

## types/index.ts - Definicions de tipus

```typescript
/**
 * Type definitions for the API Gateway
 * Custom types to handle Fastify server variations
 */

// Generic server instance type to avoid fastify import issues
// Using any for register to avoid complex Fastify type conflicts
export interface ServerInstance {
  register: any;
  listen: (options: { port: number; host: string }) => Promise<string>;
  close: () => Promise<void>;
  get: {
    (path: string, handler: any): void;
    (path: string, options: any, handler: any): void;
  };
  post: {
    (path: string, handler: any): void;
    (path: string, options: any, handler: any): void;
  };
  put: {
    (path: string, handler: any): void;
    (path: string, options: any, handler: any): void;
  };
  delete: {
    (path: string, handler: any): void;
    (path: string, options: any, handler: any): void;
  };
  setNotFoundHandler: (handler: any) => void;
  setErrorHandler: (handler: any) => void;
  log: {
    info: (message: string, ...args: any[]) => void;
    error: (message: string, ...args: any[]) => void;
    debug: (message: string, ...args: any[]) => void;
    warn: (message: string, ...args: any[]) => void;
  };
}

// Common request type
export interface AppRequest {
  ip: string;
  url: string;
  method: string;
  headers: Record<string, string | string[] | undefined>;
  body?: any;
  params?: any;
  query?: any;
}

// Common reply type
export interface AppReply {
  code: (statusCode: number) => AppReply;
  send: (payload: any) => void;
  type: (contentType: string) => AppReply;
  header: (name: string, value: string) => AppReply;
}

// WebSocket connection type
export interface WebSocketConnection {
  on: (event: string, handler: (data?: any) => void) => void;
  send: (data: any) => void;
  close: () => void;
}

// WebSocket request type
export interface WebSocketRequest {
  headers: Record<string, string | string[]>;
  url: string;
  ip: string;
}

// Generic request/reply types for middleware
export interface GenericRequest {
  ip: string;
  url: string;
  method: string;
  headers: Record<string, string | string[] | undefined>;
  body?: any;
}

export interface GenericReply {
  code: (statusCode: number) => GenericReply;
  send: (payload: any) => void;
}

// Error response type
export interface ErrorResponse {
  code: number;
  error: string;
  message: string;
  date?: number;
  expiresIn?: number;
  service?: string;
}

// Rate limit context
export interface RateLimitContext {
  ttl: number;
  totalHits: number;
  remainingHits: number;
}

// CORS callback type
export type CORSCallback = (error: Error | null, success: boolean) => void;

// Proxy options type
export interface ProxyOptions {
  upstream: string;
  prefix: string;
  rewritePrefix: string;
  http2: boolean;
  preHandler?: (request: AppRequest, reply: AppReply) => Promise<void>;
  replyOptions?: {
    onError?: (reply: AppReply, error: Error) => void;
  };
}
```

### **Anàlisi detallada:**

#### **Línies 1-3: Comentari de documentació**
```typescript
/**
 * Type definitions for the API Gateway
 * Custom types to handle Fastify server variations
 */
```

**Anàlisi caràcter per caràcter:**

##### **`/**`**
- **Caràcters**: `/` (ASCII 47), `*` (ASCII 42), `*` (ASCII 42)
- **Propòsit**: Inicia comentari de documentació JSDoc
- **Diferència**: `//` = línia única, `/* */` = bloc, `/** */` = JSDoc

##### **` * Type definitions for the API Gateway`**
- **Propòsit**: "Type definitions" - Definicions de tipus
- **Específic**: "for the API Gateway" - Per aquest servei
- **Funcionalitat**: Abstracció de tipus

##### **` * Custom types to handle Fastify server variations`**
- **"Custom types"**: Tipus personalitzats
- **"handle Fastify server variations"**: Gestionar variacions Fastify
- **Problema**: Fastify té tipus complexos que canvien

#### **Línies 5-7: Comentaris explicatius**
```typescript
// Generic server instance type to avoid fastify import issues
// Using any for register to avoid complex Fastify type conflicts
```

**Anàlisi:**
- **Línia 5**: "Generic server instance type" - Tipus genèric servidor
- **Problema**: "avoid fastify import issues" - Evitar problemes imports
- **Línia 6**: "Using any for register" - Usa `any` per register
- **Motiu**: "avoid complex Fastify type conflicts" - Evitar conflictes tipus

#### **Línies 8-37: Interfície ServerInstance**
```typescript
export interface ServerInstance {
  register: any;
  listen: (options: { port: number; host: string }) => Promise<string>;
  close: () => Promise<void>;
  get: {
    (path: string, handler: any): void;
    (path: string, options: any, handler: any): void;
  };
  post: {
    (path: string, handler: any): void;
    (path: string, options: any, handler: any): void;
  };
  put: {
    (path: string, handler: any): void;
    (path: string, options: any, handler: any): void;
  };
  delete: {
    (path: string, handler: any): void;
    (path: string, options: any, handler: any): void;
  };
  setNotFoundHandler: (handler: any) => void;
  setErrorHandler: (handler: any) => void;
  log: {
    info: (message: string, ...args: any[]) => void;
    error: (message: string, ...args: any[]) => void;
    debug: (message: string, ...args: any[]) => void;
    warn: (message: string, ...args: any[]) => void;
  };
}
```

**Anàlisi detallada:**

##### **`export interface ServerInstance {`**
- **export**: Disponible altres mòduls
- **interface**: Definició contracte
- **ServerInstance**: Nom interfície (PascalCase)
- **Brace**: `{` inicia definició

##### **`  register: any;`**
- **Propietat**: `register` - Registrar plugins
- **Tipus**: `any` - Evita conflictes tipus
- **Problema**: Perd type safety
- **Motiu**: Fastify register és molt complex

##### **`  listen: (options: { port: number; host: string }) => Promise<string>;`**
- **Propietat**: `listen` - Iniciar servidor
- **Tipus**: Function type
- **Paràmetres**: `options` - Objecte configuració
  - **port**: `number` - Port servidor
  - **host**: `string` - IP bind
- **Retorn**: `Promise<string>` - Promesa amb URL

##### **`  close: () => Promise<void>;`**
- **Propietat**: `close` - Tancar servidor
- **Paràmetres**: `()` - Cap paràmetre
- **Retorn**: `Promise<void>` - Promesa sense valor

##### **`  get: { ... };`**
- **Propietat**: `get` - Mètode HTTP GET
- **Tipus**: Object amb function signatures
- **Overloads**: Múltiples signatures

##### **`    (path: string, handler: any): void;`**
- **Signature 1**: Path + handler
- **path**: `string` - Ruta URL
- **handler**: `any` - Función handler
- **Retorn**: `void` - No retorna res

##### **`    (path: string, options: any, handler: any): void;`**
- **Signature 2**: Path + options + handler
- **options**: `any` - Configuració ruta
- **Propòsit**: Pre-handlers, validation, etc.

##### **`  post: { ... };`**
- **Estructura**: Igual que get
- **Mètode**: HTTP POST

##### **`  put: { ... };`**
- **Estructura**: Igual que get
- **Mètode**: HTTP PUT

##### **`  delete: { ... };`**
- **Estructura**: Igual que get
- **Mètode**: HTTP DELETE

##### **`  setNotFoundHandler: (handler: any) => void;`**
- **Propietat**: `setNotFoundHandler` - Handler 404
- **Paràmetre**: `handler` - Funció gestionar 404
- **Retorn**: `void` - No retorna res

##### **`  setErrorHandler: (handler: any) => void;`**
- **Propietat**: `setErrorHandler` - Handler errors
- **Paràmetre**: `handler` - Funció gestionar errors
- **Retorn**: `void` - No retorna res

##### **`  log: { ... };`**
- **Propietat**: `log` - Sistema logging
- **Tipus**: Object amb mètodes

##### **`    info: (message: string, ...args: any[]) => void;`**
- **Mètode**: `info` - Log nivell info
- **message**: `string` - Missatge principal
- **...args**: `any[]` - Arguments variables (rest parameters)
- **Retorn**: `void` - No retorna res

##### **`    error: (message: string, ...args: any[]) => void;`**
- **Mètode**: `error` - Log nivell error
- **Estructura**: Igual que info

##### **`    debug: (message: string, ...args: any[]) => void;`**
- **Mètode**: `debug` - Log nivell debug
- **Estructura**: Igual que info

##### **`    warn: (message: string, ...args: any[]) => void;`**
- **Mètode**: `warn` - Log nivell warning
- **Estructura**: Igual que info

#### **Línies 39-47: Interfície AppRequest**
```typescript
// Common request type
export interface AppRequest {
  ip: string;
  url: string;
  method: string;
  headers: Record<string, string | string[] | undefined>;
  body?: any;
  params?: any;
  query?: any;
}
```

**Anàlisi detallada:**

##### **`// Common request type`**
- **Comentari**: Tipus request comú
- **Propòsit**: Abstracció request HTTP

##### **`export interface AppRequest {`**
- **Nom**: `AppRequest` - Request aplicació
- **Abstracció**: Independient de Fastify

##### **`  ip: string;`**
- **Propietat**: `ip` - Nom propietat
- **Colon**: `:` (ASCII 58) - Separador tipus
- **Espai**: (ASCII 32) - Separador
- **Type**: `string` - Tipus primitiu
- **Semicolon**: `;` (ASCII 59) - Finalitza declaració

##### **`  url: string;`**
- **Propietat**: `url` - URL petició
- **Colon**: `:` (ASCII 58) - Separador tipus
- **Espai**: (ASCII 32) - Separador
- **Type**: `string` - Tipus primitiu
- **Semicolon**: `;` (ASCII 59) - Finalitza declaració

##### **`  method: string;`**
- **Propietat**: `method` - Mètode HTTP
- **Colon**: `:` (ASCII 58) - Separador tipus
- **Espai**: (ASCII 32) - Separador
- **Type**: `string` - Tipus primitiu
- **Semicolon**: `;` (ASCII 59) - Finalitza declaració

##### **`  headers: Record<string, string | string[] | undefined>;`**
- **Propietat**: `headers` - Headers HTTP
- **Tipus**: `Record<string, ...>` - Objecte clau-valor
- **Clau**: `string` - Nom header
- **Valor**: `string | string[] | undefined` - Single o múltiple

##### **`  body?: any;`**
- **Propietat**: `body` - Cos petició
- **Opcional**: `?` - Pot no existir
- **Tipus**: `any` - Qualsevol tipus
- **Exemple**: JSON, form data, etc.

##### **`  params?: any;`**
- **Propietat**: `params` - Paràmetres URL
- **Opcional**: `?` - Pot no existir
- **Tipus**: `any` - Qualsevol tipus
- **Exemple**: { id: "123" }

##### **`  query?: any;`**
- **Propietat**: `query` - Query string
- **Opcional**: `?` - Pot no existir
- **Tipus**: `any` - Qualsevol tipus
- **Exemple**: { page: "1", limit: "10" }

#### **Línies 49-54: Interfície AppReply**
```typescript
// Common reply type
export interface AppReply {
  code: (statusCode: number) => AppReply;
  send: (payload: any) => void;
  type: (contentType: string) => AppReply;
  header: (name: string, value: string) => AppReply;
}
```

**Anàlisi detallada:**

##### **`// Common reply type`**
- **Comentari**: Tipus reply comú
- **Propòsit**: Abstracció resposta HTTP

##### **`export interface AppReply {`**
- **Nom**: `AppReply` - Reply aplicació
- **Abstracció**: Independient de Fastify

##### **`  code: (statusCode: number) => AppReply;`**
- **Mètode**: `code` - Establir status code
- **Paràmetre**: `statusCode` - Codi HTTP
- **Tipus**: `number` - Codi numèric
- **Retorn**: `AppReply` - Chainable (fluent interface)
- **Exemple**: reply.code(200)

##### **`  send: (payload: any) => void;`**
- **Mètode**: `send` - Enviar resposta
- **Paràmetre**: `payload` - Dades resposta
- **Tipus**: `any` - Qualsevol tipus
- **Retorn**: `void` - No retorna res
- **Exemple**: reply.send({ message: "OK" })

##### **`  type: (contentType: string) => AppReply;`**
- **Mètode**: `type` - Content-Type header
- **Paràmetre**: `contentType` - Tipus contingut
- **Tipus**: `string` - MIME type
- **Retorn**: `AppReply` - Chainable
- **Exemple**: reply.type('application/json')

##### **`  header: (name: string, value: string) => AppReply;`**
- **Mètode**: `header` - Establir header
- **Paràmetre 1**: `name` - Nom header
- **Paràmetre 2**: `value` - Valor header
- **Retorn**: `AppReply` - Chainable
- **Exemple**: reply.header('X-Custom', 'value')

#### **Línies 56-61: Interfície WebSocketConnection**
```typescript
// WebSocket connection type
export interface WebSocketConnection {
  on: (event: string, handler: (data?: any) => void) => void;
  send: (data: any) => void;
  close: () => void;
}
```

**Anàlisi detallada:**

##### **`// WebSocket connection type`**
- **Comentari**: Tipus connexió WebSocket
- **Propòsit**: Abstracció WebSocket

##### **`export interface WebSocketConnection {`**
- **Nom**: `WebSocketConnection` - Connexió WebSocket
- **Protocol**: ws:// o wss://

##### **`  on: (event: string, handler: (data?: any) => void) => void;`**
- **Mètode**: `on` - Event listener
- **Paràmetre 1**: `event` - Nom event
- **Paràmetre 2**: `handler` - Funció handler
  - **data?**: `any` - Dades event (opcional)
  - **Retorn**: `void` - No retorna res
- **Retorn**: `void` - No retorna res
- **Exemple**: ws.on('message', (data) => {})

##### **`  send: (data: any) => void;`**
- **Mètode**: `send` - Enviar dades
- **Paràmetre**: `data` - Dades enviar
- **Tipus**: `any` - Qualsevol tipus
- **Retorn**: `void` - No retorna res
- **Exemple**: ws.send({ type: 'ping' })

##### **`  close: () => void;`**
- **Mètode**: `close` - Tancar connexió
- **Paràmetres**: `()` - Cap paràmetre
- **Retorn**: `void` - No retorna res
- **Exemple**: ws.close()

#### **Línies 63-67: Interfície WebSocketRequest**
```typescript
// WebSocket request type
export interface WebSocketRequest {
  headers: Record<string, string | string[]>;
  url: string;
  ip: string;
}
```

**Anàlisi detallada:**

##### **`// WebSocket request type`**
- **Comentari**: Tipus request WebSocket
- **Propòsit**: Informació inicial WebSocket

##### **`export interface WebSocketRequest {`**
- **Nom**: `WebSocketRequest` - Request WebSocket
- **Context**: Handshake inicial

##### **`  headers: Record<string, string | string[]>;`**
- **Propietat**: `headers` - Headers handshake
- **Tipus**: `Record<string, ...>` - Objecte clau-valor
- **Clau**: `string` - Nom header
- **Valor**: `string | string[]` - Single o múltiple

##### **`  url: string;`**
- **Propietat**: `url` - URL WebSocket
- **Tipus**: `string` - Path WebSocket
- **Exemple**: "/ws/game"

##### **`  ip: string;`**
- **Propietat**: `ip` - IP client
- **Tipus**: `string` - Adreça IP

#### **Línies 69-76: Interfícies genèriques**
```typescript
// Generic request/reply types for middleware
export interface GenericRequest {
  ip: string;
  url: string;
  method: string;
  headers: Record<string, string | string[] | undefined>;
  body?: any;
}

export interface GenericReply {
  code: (statusCode: number) => GenericReply;
  send: (payload: any) => void;
}
```

**Anàlisi detallada:**

##### **`// Generic request/reply types for middleware`**
- **Comentari**: Tipus genèrics per middleware
- **Propòsit**: Middleware independent

##### **`export interface GenericRequest {`**
- **Nom**: `GenericRequest` - Request genèric
- **Ús**: Middleware que no necessita tots els camps

##### **Propietats GenericRequest:**
- **ip, url, method, headers, body**: Igual que AppRequest
- **Diferència**: Sense params, query (més simple)

##### **`export interface GenericReply {`**
- **Nom**: `GenericReply` - Reply genèric
- **Ús**: Middleware bàsic

##### **Propietats GenericReply:**
- **code, send**: Igual que AppReply
- **Diferència**: Sense type, header (més simple)

#### **Línies 78-86: Interfície ErrorResponse**
```typescript
// Error response type
export interface ErrorResponse {
  code: number;
  error: string;
  message: string;
  date?: number;
  expiresIn?: number;
  service?: string;
}
```

**Anàlisi detallada:**

##### **`// Error response type`**
- **Comentari**: Tipus resposta error
- **Propòsit**: Estructura estàndard errors

##### **`export interface ErrorResponse {`**
- **Nom**: `ErrorResponse` - Resposta error
- **Estàndard**: Format consistent errors

##### **`  code: number;`**
- **Propietat**: `code` - Codi error HTTP
- **Tipus**: `number` - Codi numèric
- **Exemple**: 400, 401, 404, 500

##### **`  error: string;`**
- **Propietat**: `error` - Tipus error
- **Tipus**: `string` - Nom error
- **Exemple**: "ValidationError", "AuthenticationError"

##### **`  message: string;`**
- **Propietat**: `message` - Missatge error
- **Tipus**: `string` - Descripció llegible
- **Exemple**: "Invalid credentials"

##### **`  date?: number;`**
- **Propietat**: `date` - Timestamp error
- **Opcional**: `?` - Pot no existir
- **Tipus**: `number` - Unix timestamp
- **Exemple**: 1642694400000

##### **`  expiresIn?: number;`**
- **Propietat**: `expiresIn` - Temps expiració
- **Opcional**: `?` - Pot no existir
- **Tipus**: `number` - Segons fins expiració
- **Exemple**: 3600 (1 hora)

##### **`  service?: string;`**
- **Propietat**: `service` - Servei origen error
- **Opcional**: `?` - Pot no existir
- **Tipus**: `string` - Nom servei
- **Exemple**: "auth-service", "user-service"

#### **Línies 88-92: Interfície RateLimitContext**
```typescript
// Rate limit context
export interface RateLimitContext {
  ttl: number;
  totalHits: number;
  remainingHits: number;
}
```

**Anàlisi detallada:**

##### **`// Rate limit context`**
- **Comentari**: Context rate limiting
- **Propòsit**: Informació limits

##### **`export interface RateLimitContext {`**
- **Nom**: `RateLimitContext` - Context rate limit
- **Ús**: Tracking requests

##### **`  ttl: number;`**
- **Propietat**: `ttl` - Time to live
- **Tipus**: `number` - Segons fins reset
- **Exemple**: 60 (1 minut)

##### **`  totalHits: number;`**
- **Propietat**: `totalHits` - Total requests
- **Tipus**: `number` - Nombre total
- **Exemple**: 95 (de 100 màxim)

##### **`  remainingHits: number;`**
- **Propietat**: `remainingHits` - Requests restants
- **Tipus**: `number` - Nombre restant
- **Exemple**: 5 (fins límit)

#### **Línies 94-95: Tipus CORSCallback**
```typescript
// CORS callback type
export type CORSCallback = (error: Error | null, success: boolean) => void;
```

**Anàlisi detallada:**

##### **`// CORS callback type`**
- **Comentari**: Tipus callback CORS
- **Propòsit**: Validació CORS

##### **`export type CORSCallback = (error: Error | null, success: boolean) => void;`**
- **Keyword**: `type` - Type alias
- **Nom**: `CORSCallback` - Callback CORS
- **Function type**: `(params) => return`
- **Paràmetre 1**: `error` - Error o null
  - **Tipus**: `Error | null` - Union type
- **Paràmetre 2**: `success` - Èxit validació
  - **Tipus**: `boolean` - true/false
- **Retorn**: `void` - No retorna res

#### **Línies 97-106: Interfície ProxyOptions**
```typescript
// Proxy options type
export interface ProxyOptions {
  upstream: string;
  prefix: string;
  rewritePrefix: string;
  http2: boolean;
  preHandler?: (request: AppRequest, reply: AppReply) => Promise<void>;
  replyOptions?: {
    onError?: (reply: AppReply, error: Error) => void;
  };
}
```

**Anàlisi detallada:**

##### **`// Proxy options type`**
- **Comentari**: Tipus opcions proxy
- **Propòsit**: Configuració proxy HTTP

##### **`export interface ProxyOptions {`**
- **Nom**: `ProxyOptions` - Opcions proxy
- **Ús**: Configurar @fastify/http-proxy

##### **`  upstream: string;`**
- **Propietat**: `upstream` - URL servidor destí
- **Tipus**: `string` - URL completa
- **Exemple**: "https://auth:443"

##### **`  prefix: string;`**
- **Propietat**: `prefix` - Prefix ruta capturar
- **Tipus**: `string` - Path prefix
- **Exemple**: "/api/auth"

##### **`  rewritePrefix: string;`**
- **Propietat**: `rewritePrefix` - Reescriure prefix
- **Tipus**: `string` - Nou prefix
- **Exemple**: "/" (eliminar prefix)

##### **`  http2: boolean;`**
- **Propietat**: `http2` - Usar HTTP/2
- **Tipus**: `boolean` - true/false
- **Exemple**: false (HTTP/1.1)

##### **`  preHandler?: (request: AppRequest, reply: AppReply) => Promise<void>;`**
- **Propietat**: `preHandler` - Handler abans proxy
- **Opcional**: `?` - Pot no existir
- **Tipus**: Function async
- **Paràmetres**: request, reply
- **Retorn**: `Promise<void>` - Promesa sense valor
- **Ús**: Autenticació, validació, etc.

##### **`  replyOptions?: { ... };`**
- **Propietat**: `replyOptions` - Opcions resposta
- **Opcional**: `?` - Pot no existir
- **Tipus**: Object literal

##### **`    onError?: (reply: AppReply, error: Error) => {`**
- **Propietat**: `onError` - Handler error proxy
- **Opcional**: `?` - Pot no existir
- **Tipus**: Function
- **Paràmetres**: reply, error
- **Retorn**: `void` - No retorna res
- **Ús**: Gestió errors proxy

---

## 14. Comprehensive Analysis Summary

### 14.1 Architecture Overview

The API Gateway service represents a sophisticated, production-ready implementation of the API Gateway pattern for microservices architecture. The codebase demonstrates excellent engineering practices with clear separation of concerns, comprehensive error handling, and robust security measures.

#### 14.1.1 Core Components Analysis

**Configuration Management (`src/config/index.ts`)**
- Centralized configuration with environment variable validation
- Type-safe configuration objects with proper defaults
- Comprehensive SSL, CORS, rate limiting, and service configurations
- Environment-specific adaptations with proper fallbacks

**Server Architecture (`src/server.ts`)**
- Dual-server approach: HTTPS main server with HTTP redirect server
- Proper SSL/TLS implementation with certificate management
- Graceful HTTP-to-HTTPS redirection for security
- Fastify-based implementation optimized for performance

**Type System (`src/types/index.ts`)**
- Comprehensive TypeScript interfaces covering all aspects
- Proper typing for server instances, requests, responses, and errors
- WebSocket and proxy-specific type definitions
- Strong type safety throughout the application

**Middleware Stack (`src/middleware/index.ts`)**
- Layered security with Helmet for HTTP security headers
- Comprehensive CORS configuration with dynamic origins
- Rate limiting with Redis backend for distributed systems
- Static file serving with proper caching and security
- WebSocket middleware for real-time communication

**Routing System**
- **Health Routes (`src/routes/health.ts`)**: Comprehensive health monitoring with detailed API information
- **Proxy Routes (`src/routes/proxy.ts`)**: Dynamic proxy configuration for all microservices with proper error handling
- **WebSocket Routes (`src/routes/websocket.ts`)**: Real-time communication for games and notifications

**Utility Functions (`src/utils/index.ts`)**
- Robust error handling with user-friendly error responses
- Graceful shutdown with proper cleanup procedures
- Server startup with comprehensive configuration validation
- SPA fallback handling for single-page applications

### 14.2 Security Analysis

#### 14.2.1 Security Strengths
- **HTTPS Enforcement**: Mandatory HTTPS with automatic HTTP redirection
- **Security Headers**: Comprehensive HTTP security headers via Helmet
- **CORS Protection**: Proper CORS configuration with environment-specific origins
- **Rate Limiting**: Redis-backed rate limiting to prevent abuse
- **Input Validation**: Proper request validation and sanitization
- **SSL/TLS**: Strong SSL configuration with proper certificate management

#### 14.2.2 Security Considerations
- **Self-Signed Certificates**: Development-only SSL certificates (not production-ready)
- **Error Information**: Error responses could potentially leak information
- **Rate Limiting**: Rate limiting rules may need environment-specific tuning
- **CORS Configuration**: CORS settings require careful production configuration

### 14.3 Performance Analysis

#### 14.3.1 Performance Optimizations
- **Fastify Framework**: High-performance web framework chosen for speed
- **Async/Await**: Proper asynchronous programming patterns throughout
- **Connection Pooling**: HTTP agent configuration for efficient connections
- **Static File Caching**: Proper caching headers for static content
- **Efficient Routing**: Optimized route registration and matching

#### 14.3.2 Scalability Features
- **Redis Integration**: Distributed rate limiting and session management
- **Proxy Architecture**: Efficient request forwarding to backend services
- **WebSocket Scaling**: Proper WebSocket connection management
- **Graceful Shutdown**: Clean shutdown procedures for zero-downtime deployments

### 14.4 Maintainability Analysis

#### 14.4.1 Code Quality
- **Modular Architecture**: Clear separation of concerns across modules
- **Type Safety**: Comprehensive TypeScript typing throughout
- **Error Handling**: Consistent error handling patterns
- **Documentation**: Inline documentation and clear naming conventions
- **Configuration Management**: Centralized, type-safe configuration

#### 14.4.2 Development Experience
- **TypeScript**: Full TypeScript support with proper configurations
- **Docker Integration**: Complete Docker setup with multi-stage builds
- **Development Tools**: Proper development and build tooling
- **Testing Ready**: Architecture supports comprehensive testing

### 14.5 Deployment Analysis

#### 14.5.1 Container Readiness
- **Docker Optimization**: Multi-stage builds for production efficiency
- **Health Checks**: Comprehensive health check endpoints
- **Environment Configuration**: Proper environment variable handling
- **SSL Management**: Automated SSL certificate generation
- **Graceful Shutdown**: Container-friendly shutdown procedures

#### 14.5.2 Production Considerations
- **Environment Variables**: Comprehensive environment configuration
- **Service Discovery**: Proper service endpoint configuration
- **Monitoring**: Health check and API information endpoints
- **Security**: Production-ready security configurations (with proper certificates)

### 14.6 Integration Analysis

#### 14.6.1 Microservices Integration
- **Service Proxy**: Comprehensive proxy configuration for all backend services
- **WebSocket Support**: Real-time communication integration
- **Health Monitoring**: Service health check aggregation
- **Error Handling**: Proper error propagation and handling

#### 14.6.2 Frontend Integration
- **CORS Configuration**: Proper frontend integration support
- **Static File Serving**: SPA support with fallback routing
- **WebSocket**: Real-time communication for interactive features
- **API Versioning**: Support for versioned API endpoints

### 14.7 Areas for Enhancement

#### 14.7.1 Monitoring and Observability
- **Metrics Collection**: Add comprehensive metrics collection
- **Logging**: Structured logging for better observability
- **Tracing**: Distributed tracing for request flows
- **Performance Monitoring**: Request/response time tracking

#### 14.7.2 Security Enhancements
- **Authentication**: JWT validation and user authentication
- **Authorization**: Role-based access control
- **Rate Limiting**: More sophisticated rate limiting rules
- **Certificate Management**: Automatic certificate renewal

#### 14.7.3 Development Tools
- **Testing Framework**: Comprehensive test suites
- **Development Proxy**: Hot-reload development proxy
- **API Documentation**: Automated API documentation generation
- **Performance Testing**: Load testing and performance benchmarks

### 14.8 Best Practices Demonstrated

#### 14.8.1 Architecture Patterns
- **API Gateway Pattern**: Proper implementation of microservices gateway
- **Configuration Pattern**: Centralized configuration management
- **Error Handling Pattern**: Consistent error handling throughout
- **Security Pattern**: Layered security implementation

#### 14.8.2 Development Practices
- **TypeScript Usage**: Proper type safety and modern JavaScript features
- **Async Programming**: Proper async/await patterns
- **Modular Design**: Clean module separation and organization
- **Documentation**: Comprehensive inline and external documentation

### 14.9 Production Readiness Assessment

#### 14.9.1 Ready for Production
- **Error Handling**: Robust error handling and recovery
- **Security**: Comprehensive security implementation
- **Performance**: Optimized for high throughput
- **Scalability**: Designed for horizontal scaling
- **Monitoring**: Health checks and monitoring endpoints

#### 14.9.2 Production Requirements
- **Certificate Management**: Replace self-signed certificates with proper CA certificates
- **Environment Configuration**: Proper production environment variables
- **Monitoring Setup**: Implement comprehensive monitoring and alerting
- **Load Testing**: Performance testing and optimization
- **Security Audit**: Security review and penetration testing

### 14.10 Conclusion

The API Gateway service represents a well-architected, production-ready implementation that successfully addresses the core requirements of a microservices gateway. The codebase demonstrates excellent engineering practices with proper error handling, security implementation, and performance optimization.

Key strengths include:
- Comprehensive security implementation
- Robust error handling and recovery
- Excellent code organization and maintainability
- Production-ready architecture patterns
- Strong type safety and documentation

The service is well-positioned to serve as the central gateway for the ft_transcendence application, providing secure, scalable, and maintainable access to all backend microservices while supporting real-time communication and comprehensive monitoring.

With proper production configuration (certificates, monitoring, load testing), this API Gateway service is ready for deployment in a production environment and can scale to handle the demands of a real-world application.

---

# END OF ANALYSIS

This completes the exhaustive, character-by-character and line-by-line analysis of the API Gateway service for ft_transcendence. Every file, symbol, line, and architectural decision has been documented with detailed explanations of purpose, implementation, and architectural context.

**Total Files Analyzed: 13**
1. package.json - Dependencies and build configuration
2. tsconfig.json - TypeScript compilation configuration
3. Dockerfile - Container build and deployment configuration
4. src/server.ts - Server creation and HTTPS setup
5. src/config/index.ts - Centralized configuration management
6. src/types/index.ts - TypeScript type definitions
7. src/middleware/index.ts - Middleware stack implementation
8. src/routes/health.ts - Health monitoring endpoints
9. src/routes/proxy.ts - Microservice proxy routing
10. src/routes/websocket.ts - WebSocket real-time communication
11. src/utils/index.ts - Utility functions and error handling
12. src/index.ts - Main application entry point
13. README.md - Service documentation
14. ssl/ssl.sh - SSL certificate generation script

The analysis provides comprehensive understanding of the API Gateway's architecture, security, performance, maintainability, and production readiness.
