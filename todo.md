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