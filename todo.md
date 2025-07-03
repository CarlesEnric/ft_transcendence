# TODO FT_TRANSCENDENCE
Connectar babylonjs via importacio per package.json o cdn perque funcioni
Ara no carrega res i no sembla que la connexio sigui correcta i...
he afegit cdn al html i scriptSrc: ["'self'", "https://cdn.jsdelivr.net"] al helmet/CSP

NOU MERDER!!!...averiguar com importar de manera correcta el babylon

Aquest error vol dir que el teu `/pong/main.js` (el codi client) fa:

```typescript
import * as BABYLON from 'babylonjs';
```

...però **els imports “bare” (sense ruta relativa)** només funcionen amb bundlers (Vite, Webpack, etc.) o Node.js, **no directament al navegador**.

### Solucions:

#### 1. **Carrega Babylon.js via CDN al teu HTML**

Afegeix això al `<head>` del teu HTML principal:

```html
<script src="https://cdn.babylonjs.com/babylon.js"></script>
```

I al teu `main.ts`/`main.js` **NO** facis `import * as BABYLON from 'babylonjs';`, sinó que assumes que `BABYLON` ja està a `window`:

```javascript
const canvas = document.getElementById('renderCanvas');
const engine = new window.BABYLON.Engine(canvas, true);
const scene = new window.BABYLON.Scene(engine);
// ... resta del codi ...
```

#### 2. **Fes servir un bundler (recomanat per projectes grans)**

Si vols mantenir els imports ES6, has de compilar el teu frontend amb un bundler (Vite, Webpack, Parcel, etc.) que resolgui els imports i generi un únic fitxer JS per al navegador.

#### 3. **Importa Babylon.js com a mòdul ES des d’un CDN**

Si vols usar imports de mòdul, pots fer:

```javascript
import * as BABYLON from 'https://cdn.jsdelivr.net/npm/babylonjs@6.41.0/babylon.module.js';
```

> **Nota:** Assegura’t que el teu `main.js` s’exporta com a mòdul (`<script type="module" ...>`) i que el navegador suporta ES Modules.

---

**Avantatges d’un bundler (com Vite) per un projecte:**

- **Importació de mòduls moderna:** Pots fer `import * as BABYLON from 'babylonjs'` i altres imports d’NPM sense preocupar-te de rutes ni de carregar scripts externs manualment.
- **Compilació automàtica de TypeScript:** Vite compila `.ts` a `.js` i ho serveix al navegador sense passos manuals.
- **Hot Reload:** Quan canvies el codi, el navegador es refresca automàticament.
- **Optimització:** El codi JS i CSS es minifica i optimitza per producció.
- **Gestió d’actius:** Pots importar imatges, CSS, etc. directament des del teu codi.
- **Compatibilitat CSP:** No cal carregar scripts externs (CDN), així que la teva CSP pot ser més estricta i segura.

**només instal·lar Vite al microservei que serveix el frontend** (on tens el teu SPA, BabylonJS, etc.), no a tots els microserveis.

### **Per què?**
- Vite és un bundler i servidor de desenvolupament per a aplicacions web (frontend).
- Els altres microserveis (auth, backend, game-service, etc.) són serveis de backend i no necessiten Vite.


---

### **Com aplicar Vite al teu projecte ja creat**

#### **1. Instal·la Vite i dependències**

Des de la carpeta del teu frontend (ex: `frontend-service`):

```bash
npm install -D vite
npm install babylonjs
```

#### **2. Crea la configuració bàsica de Vite**

Afegeix un fitxer `vite.config.ts` a la carpeta arrel del frontend:

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  root: './', // o el directori on tens el teu index.html
  build: {
    outDir: 'dist',
  },
});
```

#### **3. Estructura recomanada**

```
frontend-service/
├── index.html
├── src/
│   └── pong/
│       └── main.ts
├── vite.config.ts
├── package.json
└── ...
```

#### **4. Modifica el teu `index.html`**

Assegura’t que el teu HTML apunta al fitxer TypeScript:

```html
<script type="module" src="/src/pong/main.ts"></script>
```

#### **5. Fes servir imports moderns**

Ara pots fer servir:

```typescript
import * as BABYLON from 'babylonjs';
// ...la resta del teu codi...
```

#### **6. Executa el servidor de desenvolupament**

```bash
npx vite
```
Obre el navegador a l’adreça que et dona Vite (normalment http://localhost:5173).

#### **7. Compila per producció**

```bash
npx vite build
```
Els fitxers optimitzats es generaran a la carpeta `dist/`.

---


MIRAR el tema de JWT amb la part del pong, veure error en el navegador