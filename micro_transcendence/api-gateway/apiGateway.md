## **1. Importacions**

```typescript
import Fastify from 'fastify';
import fastifyHttpProxy from '@fastify/http-proxy';
import { FastifyRequest } from 'fastify';
import { IncomingHttpHeaders } from 'http';
import fs from 'fs';
```
- **Fastify**: Framework web per Node.js, molt ràpid i lleuger, ideal per microserveis i APIs.
- **fastifyHttpProxy**: Plugin que permet fer de reverse proxy, redirigint peticions HTTP cap a altres serveis.
- **FastifyRequest**: Tipus per tipar correctament les peticions dins Fastify.
- **IncomingHttpHeaders**: Tipus per gestionar headers HTTP de Node.js.
- **fs**: Mòdul de Node.js per llegir fitxers del sistema (aquí, per llegir els certificats SSL).

---

## **2. Creació de la instància Fastify amb HTTPS i logger**

```typescript
const app = Fastify({
  https: {
    key: fs.readFileSync('/app/key.pem'),
    cert: fs.readFileSync('/app/cert.pem'),
  },
  logger: {
    level: 'debug',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  }
});
```
- **https**:  
  - `key` i `cert` són els fitxers de clau privada i certificat per HTTPS.  
  - Això fa que el gateway només accepti connexions segures (xifrades).
  - **Millora:** Pots llegir la ruta dels certificats des de variables d’entorn per facilitar el desplegament en diferents entorns.
- **logger**:  
  - `level: 'debug'` mostra molta informació útil per desenvolupament.
  - `pino-pretty` fa que els logs siguin més llegibles.
  - **Millora:** En producció, pots posar `level: 'info'` o `level: 'warn'` per menys soroll.

---

## **3. Funció per copiar cookies (headers) entre client i microserveis**

```typescript
const rewriteHeaders = (req: FastifyRequest, headers: IncomingHttpHeaders) => {
  if (req.headers.cookie) {
    headers.cookie = req.headers.cookie;
  }
  return headers;
};
```
- Aquesta funció copia la cookie de la request original als headers de la request proxada.
- **Per què?**  
  - Si fas servir autenticació basada en cookies (com JWT HttpOnly), el microservei necessita rebre la cookie original.
- **Millora:**  
  - Pots copiar altres headers importants (com Authorization, X-Request-ID, etc).
  - Pots filtrar o modificar headers per seguretat.

---

## **4. Registre de Proxies per cada microservei**

Cada bloc `app.register(...)` configura un proxy per a un microservei diferent.  
**Exemple per auth-service:**

```typescript
app.register((fastifyHttpProxy as any).default || fastifyHttpProxy, {
  upstream: 'https://auth-service:7001', // Nom DNS del servei dins Docker
  prefix: '/auth',                       // Les peticions que comencen per /auth es proxen aquí
  http2: false,                          // No s’utilitza HTTP/2
  httpOnly: true,                        // Opció de cookies (no sempre té efecte en proxy)
  secure: true,                          // Només cookies segures (HTTPS)
  sameSite: 'lax',                       // Política de cookies SameSite
  undici: {
    rejectUnauthorized: true              // Valida el certificat SSL del microservei
  },
  // replyOptions: {
  //   rewriteHeaders: rewriteHeaders     // Pots descomentar per passar cookies/headers personalitzats
  // }
});
```
- **upstream**:  
  - URL del microservei de destí.  
  - En Docker, pots fer servir el nom del servei (`auth-service`) com a hostname.
- **prefix**:  
  - Prefix d’URL que es farà servir per accedir a aquest servei via gateway (`/auth` → auth-service).
- **undici.rejectUnauthorized**:  
  - Si és `true`, només accepta certificats vàlids (producció).
  - Si és `false`, accepta self-signed (desenvolupament).
- **replyOptions.rewriteHeaders**:  
  - Si vols passar cookies o headers personalitzats, activa-ho.

**La resta de blocs són iguals, canviant només `upstream` i `prefix` per cada microservei** (`backend`, `frontend`, `game`).

---

## **5. Arrencada del servidor**

```typescript
const start = async () => {
  try {
    await app.listen({ port: 8000, host: "0.0.0.0" });
    app.log.info("API Gateway running on https://localhost:8000");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
```
- **app.listen**:  
  - Escolta a `0.0.0.0:8000`, així accepta connexions de qualsevol IP (necessari per Docker).
- **app.log.info**:  
  - Mostra un missatge d’info quan el servidor arrenca.
- **Gestió d’errors**:  
  - Si hi ha un error a l’arrencada, es mostra i el procés es tanca.

---

## **Millores i bones pràctiques addicionals**

1. **Centralitza la configuració**  
   - Fes servir variables d’entorn o un fitxer de config per definir upstreams, ports, rutes de certificats, etc.

2. **Gestió d’errors de proxy**  
   - Pots afegir un handler global per mostrar errors més clars si un microservei no respon.

3. **Logging avançat**  
   - Afegeix un identificador únic per request (X-Request-ID) per traçar peticions entre serveis.

4. **Rate limiting i seguretat**  
   - Pots afegir plugins de Fastify per limitar el nombre de peticions i protegir contra atacs.

5. **Monitorització i mètriques**  
   - Afegeix endpoints de salut (`/health`) i mètriques (`/metrics`) per monitoritzar l’estat del gateway.

6. **HTTP/2 i compressió**  
   - Pots activar HTTP/2 i compressió per millorar el rendiment si el teu entorn ho permet.

7. **CORS**  
   - Si exposes APIs públiques, configura correctament CORS per evitar problemes de seguretat.

8. **Documentació**  
   - Documenta cada prefix i microservei, i mantén un diagrama d’arquitectura.

---

## **Resum conceptual**

- **Aquest codi implementa un API Gateway amb HTTPS** que fa de reverse proxy a diversos microserveis, cadascun amb el seu prefix.
- **El Gateway centralitza la seguretat i l’accés extern**: només ell exposa HTTPS a l’usuari, la resta de serveis són interns.
- **Això permet escalar, protegir i modularitzar l’arquitectura**.
- **Amb les millores suggerides, pots fer-lo més robust, segur i fàcil de mantenir.**

---

Per descomptat! Aquí tens una **explicació molt detallada i àmplia** de les millores proposades per a un API Gateway modern, robust i segur, amb context de per què són importants i com s’apliquen a la teva arquitectura.

---

## **1. Configuració centralitzada i variables d’entorn**

**Què és?**  
- Separar la configuració (rutes, ports, certificats, noms d’upstream, flags de seguretat) del codi font.
- Utilitzar variables d’entorn (`process.env`) o fitxers `.env` per definir valors segons l’entorn (dev, prod, staging...).

**Per què?**  
- Facilita el desplegament en diferents entorns sense tocar el codi.
- Evita exposar secrets o rutes sensibles al repositori.

**Com s’aplica?**
```typescript
const config = {
  https: {
    key: fs.readFileSync(process.env.GATEWAY_KEY_PATH || '/app/key.pem'),
    cert: fs.readFileSync(process.env.GATEWAY_CERT_PATH || '/app/cert.pem'),
  },
  services: {
    auth: process.env.AUTH_URL || 'https://auth-service:7001',
    backend: process.env.BACKEND_URL || 'https://backend-service:7002',
    frontend: process.env.FRONTEND_URL || 'https://frontend-service:7003',
    game: process.env.GAME_URL || 'https://game-service:7004',
  },
  rejectUnauthorized: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.GATEWAY_PORT || '8000'),
};
```
---

## **2. Gestió d’errors de proxy**

**Què és?**  
- Capturar i gestionar errors quan el gateway no pot connectar-se a un microservei (per exemple, si està caigut o no respon).

**Per què?**  
- Sense gestió d’errors, l’usuari veu errors genèrics o poc clars.
- Permet loguejar i monitoritzar problemes de connectivitat.

**Com s’aplica?**
```typescript
onError: (req, reply, error) => {
  req.log.error({ err: error }, `Proxy error for ${prefix}`);
  reply.status(502).send({ error: `Bad Gateway: ${prefix} unavailable` });
}
```
---

## **3. Logging avançat i traçabilitat (X-Request-ID)**

**Què és?**  
- Assignar un identificador únic a cada request i propagar-lo entre microserveis.

**Per què?**  
- Permet seguir una petició a través de tot el sistema (logs correlacionats).
- Facilita el debugging i la monitorització.

**Com s’aplica?**
```typescript
import crypto from 'crypto';
app.addHook('onRequest', async (req, reply) => {
  const id = crypto.randomUUID();
  req.headers['x-request-id'] = id;
  reply.header('x-request-id', id);
});


```
No, **no és `crypto-js`**.  
El que utilitzes és el **mòdul natiu de Node.js** anomenat simplement `crypto`, que **ja ve inclòs amb Node** i **no cal instal·lar-lo amb npm**.

---

## **Per a què serveix `crypto` aquí?**

- S’utilitza per generar un **identificador únic** per cada request HTTP, anomenat `X-Request-ID`.
- Aquesta ID es genera amb `crypto.randomUUID()`, que retorna un UUID (identificador universal únic) com `a1b2c3d4-...`.
- El valor es posa tant als headers de la request com a la resposta.

### **Per què serveix un X-Request-ID?**

- **Traçabilitat:** Permet seguir una petició concreta a través de tot el sistema (gateway i microserveis) als logs.
- **Debugging:** Si un usuari té un problema, pots buscar el seu `X-Request-ID` als logs i veure tot el recorregut de la seva petició.
- **Monitorització:** Ajuda a correlacionar errors o latències entre serveis.

### **Exemple d’ús:**
```typescript
import crypto from 'crypto';

app.addHook('onRequest', async (req, reply) => {
  const id = crypto.randomUUID(); // Genera un UUID
  req.headers['x-request-id'] = id; // El posa al header de la request
  reply.header('x-request-id', id); // El posa al header de la resposta
});
```

---

## **Resum**

- **`crypto`** és el mòdul natiu de Node.js, no cal npm install.
- **No facis servir `crypto-js` per això.**
- **Serveix per generar IDs úniques** per traçabilitat i debugging entre serveis.

---

**Si vols més exemples d’ús de X-Request-ID o com buscar-lo als logs, demana-ho!**

- També cal passar aquest header als microserveis via `rewriteHeaders`.

---

## **4. Rate limiting**

**Què és?**  
- Limitar el nombre de peticions que pot fer una IP en un període de temps.

**Per què?**  
- Protegeix contra atacs de força bruta, DoS i abusos.

**Com s’aplica?**
```typescript
import fastifyRateLimit from '@fastify/rate-limit';
app.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '1 minute'
});
```
---

## **5. CORS (Cross-Origin Resource Sharing)**

**Què és?**  
- Controlar quins dominis poden fer peticions al teu API Gateway.

**Per què?**  
- Evita que webs malicioses facin peticions a la teva API des d’altres dominis.
- Necessari si el teu frontend i backend són a dominis diferents.

**Com s’aplica?**
```typescript
import fastifyCors from '@fastify/cors';
app.register(fastifyCors, {
  origin: true,
  credentials: true
});
```
---

## **6. Endpoint de salut i mètriques**

**Què és?**  
- Un endpoint `/health` que retorna l’estat del gateway.
- Un endpoint `/metrics` (opcional) per Prometheus o altres eines de monitorització.

**Per què?**  
- Permet a orquestradors (Docker, Kubernetes) i sistemes de monitorització saber si el servei està viu.
- Ajuda a detectar problemes abans que afectin els usuaris.

**Com s’aplica?**
```typescript
app.get('/health', async (req, reply) => {
  reply.send({ status: 'ok', time: new Date().toISOString() });
});
```
---

## **7. Headers personalitzats i seguretat**

**Què és?**  
- Passar només els headers necessaris als microserveis.
- Filtrar o modificar headers per evitar exposar informació sensible.

**Per què?**  
- Millora la seguretat i la privadesa.
- Evita que informació interna es filtri a l’exterior.

**Com s’aplica?**
```typescript
const rewriteHeaders = (req, headers) => {
  if (req.headers.cookie) headers.cookie = req.headers.cookie;
  if (req.headers['x-request-id']) headers['x-request-id'] = req.headers['x-request-id'];
  // Pots afegir més headers aquí
  return headers;
};
```
---

## **8. Centralització i mantenibilitat**

**Què és?**  
- Tenir tota la configuració i registre de microserveis en un sol lloc, fàcil de modificar.

**Per què?**  
- Facilita afegir, treure o modificar microserveis sense duplicar codi.
- Redueix errors humans i fa el codi més net.

**Com s’aplica?**
```typescript
const proxyOptions = (upstream: string, prefix: string) => ({
  upstream,
  prefix,
  // ...altres opcions...
});
app.register(fastifyHttpProxy, proxyOptions(config.services.auth, '/auth'));
```
---

## **9. Producció vs Desenvolupament**

**Què és?**  
- Tenir comportaments diferents segons l’entorn (per exemple, acceptar certificats self-signed només en desenvolupament).

**Per què?**  
- Més seguretat en producció, més flexibilitat en desenvolupament.

**Com s’aplica?**
```typescript
undici: {
  rejectUnauthorized: process.env.NODE_ENV === 'production'
}
```
---

## **10. Documentació i diagrama d’arquitectura**

**Què és?**  
- Documentar cada prefix, microservei i la seva funció.
- Mantenir un diagrama visual de l’arquitectura.

**Per què?**  
- Facilita l’onboarding de nous desenvolupadors.
- Ajuda a detectar colls d’ampolla i punts febles.

---

## **Resum visual de l’arquitectura millorada**

```
[Usuari] <--HTTPS--> [API Gateway] <--HTTPS--> [Microserveis]
                                 |-- /auth --> [auth-service]
                                 |-- /backend --> [backend-service]
                                 |-- /game --> [game-service]
                                 |-- /        --> [frontend-service]
```

---

**Amb aquestes millores, el teu API Gateway serà:**
- **Més segur** (rate limit, CORS, headers filtrats, SSL correcte)
- **Més robust** (gestió d’errors, healthcheck, logging traçable)
- **Més fàcil de mantenir i escalar** (config centralitzada, documentació)
- **Preparat per producció i desenvolupament**


Aquí tens una explicació **detallada** de cadascuna d’aquestes millores avançades, per què són útils i com s’apliquen a un API Gateway Fastify:

---

## **1. Mètriques Prometheus**

**Què és?**  
Prometheus és una eina de monitorització que recull mètriques (CPU, memòria, peticions HTTP, latència, etc.) i permet fer alertes i dashboards.

**Per què?**  
- Pots veure l’estat i el rendiment del teu gateway en temps real.
- Pots detectar colls d’ampolla, errors o caigudes abans que afectin els usuaris.

**Com s’aplica?**  
- Afegeix el plugin [`@fastify/metrics`](https://github.com/fastify/fastify-metrics):

```typescript
import fastifyMetrics from '@fastify/metrics';
app.register(fastifyMetrics, { endpoint: '/metrics' });
```
- Ara Prometheus pot fer `GET https://localhost:8000/metrics` i recollir mètriques del gateway.

---

## **2. HTTP/2**

**Què és?**  
HTTP/2 és una versió moderna del protocol HTTP que permet multiplexar peticions, millorar la velocitat i l’eficiència de la xarxa.

**Per què?**  
- Millora el rendiment, especialment amb moltes peticions simultànies.
- Redueix la latència i aprofita millor la connexió.

**Com s’aplica?**  
- Fastify suporta HTTP/2 nativament si passes l’opció `http2: true` i tens els certificats adequats:

```typescript
const app = Fastify({
  http2: true,
  https: {
    key: fs.readFileSync('/app/key.pem'),
    cert: fs.readFileSync('/app/cert.pem'),
  },
  // ...
});
```
- **Nota:** No tots els proxies o navegadors suporten HTTP/2 amb self-signed certs, però en producció és molt recomanable.

---

## **3. Validació de request**

**Què és?**  
Validar que només es permeten certs mètodes HTTP (GET, POST, etc.) o rutes, i que les dades d’entrada són correctes.

**Per què?**  
- Evita que usuaris maliciosos facin servir mètodes no desitjats (ex: DELETE).
- Millora la seguretat i la robustesa del sistema.

**Com s’aplica?**  
- Pots afegir un hook global o per ruta:

```typescript
app.addHook('onRequest', async (req, reply) => {
  // Exemple: només permet GET i POST
  if (!['GET', 'POST'].includes(req.method)) {
    reply.code(405).send({ error: 'Method Not Allowed' });
  }
});
```
- També pots validar paràmetres, headers, etc. amb schemas de Fastify.

---

## **4. Documentació OpenAPI (Swagger)**

**Què és?**  
OpenAPI (Swagger) és un estàndard per documentar APIs de manera interactiva i llegible per humans i màquines.

**Per què?**  
- Facilita l’onboarding de nous desenvolupadors.
- Permet provar l’API des d’una interfície web.
- Ajuda a mantenir la documentació sincronitzada amb el codi.

**Com s’aplica?**  
- Afegeix el plugin [`@fastify/swagger`](https://github.com/fastify/fastify-swagger):

```typescript
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'API Gateway',
      version: '1.0.0',
      description: 'Documentació de l’API Gateway'
    }
  }
});
app.register(fastifySwaggerUi, {
  routePrefix: '/docs'
});
```
- Ara pots veure la documentació a `https://localhost:8000/docs`.

---

## **Resum visual**

- **/metrics** → Mètriques Prometheus per monitorització.
- **HTTP/2** → Millor rendiment i eficiència.
- **Validació** → Més seguretat i control de les peticions.
- **/docs** → Documentació interactiva de l’API Gateway.

---

Perfecte! T’explico **Swagger (OpenAPI)** i després com activar **HTTP/2** i utilitzar **Let’s Encrypt** per tenir certificats vàlids en el teu projecte.

---

## 1. **Què és Swagger (OpenAPI) i per a què serveix?**

- **OpenAPI (abans Swagger)** és un estàndard per documentar APIs REST de manera estructurada i llegible per màquines i humans.
- Permet generar una **documentació interactiva** (amb formularis per provar endpoints) i facilita la integració amb altres serveis.
- Amb Fastify, pots afegir Swagger fàcilment i documentar el teu API Gateway o qualsevol microservei.

### **Avantatges:**
- **Proves interactives:** Pots provar endpoints directament des del navegador.
- **Documentació sempre actualitzada:** Si canvies l’API, la documentació es pot regenerar automàticament.
- **Generació de clients:** Pots generar SDKs per a diferents llenguatges a partir de l’OpenAPI.

---

### **Com afegir Swagger a Fastify (API Gateway o microservei)**

1. **Instal·la els paquets:**
   ```bash
   npm install @fastify/swagger @fastify/swagger-ui
   ```

2. **Afegeix-ho al teu codi:**
   ````typescript
   import fastifySwagger from '@fastify/swagger';
   import fastifySwaggerUi from '@fastify/swagger-ui';

   // Registra Swagger (OpenAPI)
   app.register(fastifySwagger, {
     openapi: {
       info: {
         title: 'API Gateway',
         description: 'Documentació interactiva de l’API Gateway',
         version: '1.0.0'
       }
     }
   });

   // Registra la UI de Swagger
   app.register(fastifySwaggerUi, {
     routePrefix: '/docs', // La documentació serà a https://localhost:8000/docs
   });

   // Exemple d’endpoint documentat
   app.get('/health', {
     schema: {
       description: 'Endpoint de salut',
       response: {
         200: {
           type: 'object',
           properties: {
             status: { type: 'string' },
             time: { type: 'string' }
           }
         }
       }
     }
   }, async (req, reply) => {
     reply.send({ status: 'ok', time: new Date().toISOString() });
   });
   ````

3. **Accedeix a la documentació:**  
   - Un cop arrencat el servidor, ves a `https://localhost:8000/docs`  
   - Veuràs la documentació interactiva i podràs provar endpoints.

---

## 2. **HTTP/2 amb Fastify**

- **HTTP/2** millora el rendiment i la seguretat, especialment amb moltes peticions simultànies.
- Fastify suporta HTTP/2 nativament si el teu Node.js està compilat amb suport per a HTTP/2 (la majoria de versions modernes ho tenen).

### **Com activar HTTP/2:**
````typescript
const app = Fastify({
  http2: true,
  https: {
    key: fs.readFileSync('/app/key.pem'),
    cert: fs.readFileSync('/app/cert.pem'),
  },
  logger: { ... }
});
````

- **Nota:** HTTP/2 només funciona amb HTTPS (no amb HTTP simple).

---

## 3. **Let’s Encrypt: Certificats SSL gratuïts i vàlids**

**Let’s Encrypt** és una autoritat de certificació gratuïta i automàtica.  
Amb Let’s Encrypt pots obtenir certificats SSL vàlids per a qualsevol domini públic.

### **Com implementar Let’s Encrypt al teu projecte:**

#### **A. En local (desenvolupament):**
- No pots utilitzar Let’s Encrypt amb `localhost`.  
- Per local, segueix amb self-signed o utilitza [mkcert](https://github.com/FiloSottile/mkcert) per generar certificats de desenvolupament.

#### **B. En producció (amb domini públic):**

1. **Tingues un domini públic (ex: `api.elteudomini.com`).**
2. **Utilitza una eina com [certbot](https://certbot.eff.org/) per obtenir el certificat:**
   ```bash
   sudo certbot certonly --standalone -d api.elteudomini.com
   ```
   - Això et generarà els fitxers `fullchain.pem` i `privkey.pem` a `/etc/letsencrypt/live/api.elteudomini.com/`

3. **Configura Fastify per fer servir aquests certificats:**
   ````typescript
   const app = Fastify({
     http2: true,
     https: {
       key: fs.readFileSync('/etc/letsencrypt/live/api.elteudomini.com/privkey.pem'),
       cert: fs.readFileSync('/etc/letsencrypt/live/api.elteudomini.com/fullchain.pem'),
     },
     logger: { ... }
   });
   ````

4. **Renovació automàtica:**  
   - Let’s Encrypt caduca cada 90 dies.  
   - Pots programar una tasca cron per renovar automàticament:
     ```bash
     0 3 * * * certbot renew --quiet
     ```

#### **C. Si uses Docker:**
- Pots muntar els certificats dins el contenidor amb un volum:
  ```yaml
  volumes:
    - /etc/letsencrypt/live/api.elteudomini.com:/app/certs:ro
  ```
- I després:
  ```typescript
  key: fs.readFileSync('/app/certs/privkey.pem'),
  cert: fs.readFileSync('/app/certs/fullchain.pem'),
  ```

---

## **Resum**

- **Swagger** et dona documentació interactiva i sempre actualitzada.
- **HTTP/2** millora el rendiment i la seguretat.
- **Let’s Encrypt** et permet tenir SSL vàlid i gratuït en producció.

---

{
  "name": "api-gateway",
  "version": "1.0.0",
  "description": "API Gateway Fastify amb TypeScript",
  "main": "dist/index.js",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts"
  },
  "author": "",
  "license": "MIT",
  "dependencies": {
    "fastify": "^5.4.0",
    "@fastify/cors": "^11.0.1",
    "@fastify/http-proxy": "^11.1.0",
    "@fastify/rate-limit": "^10.3.0",
    "@fastify/swagger": "^9.5.1",
    "@fastify/swagger-ui": "^5.2.3",
    "prom-client": "^14.1.1"
  },
  "devDependencies": {
    "typescript": "^5.8.3",
    "ts-node": "^10.9.2",
    "@types/node": "^24.0.1"
  }
}