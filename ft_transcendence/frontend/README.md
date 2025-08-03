# 🎨 Frontend - React Single Page Application

## 📋 Visió General

El Frontend de ft_transcendence és una **Single Page Application (SPA)** construïda amb React, TypeScript i Tailwind CSS. Proporciona una interfície d'usuari moderna i responsiva per a la plataforma de jocs, amb autenticació, dashboard, jocs en temps real i gestió de perfils.

## 🔧 Tecnologies

- **React 18**: Library principal amb hooks moderns
- **TypeScript**: Type safety i desenvolupament robust  
- **Tailwind CSS**: Framework CSS utility-first
- **Vite**: Build tool ràpid i modern
- **Client-side Routing**: Navegació SPA sense recarregar
- **WebSocket Client**: Comunicació temps real per jocs
- **API Client**: Integració amb microserveis backend

## 📁 Estructura del Codi

```
frontend/
├── src/
│   ├── App.tsx              # Component principal i routing
│   ├── main.tsx             # Entry point de React
│   ├── index.css            # Styles globals i Tailwind imports
│   │
│   ├── components/          # Components React reutilitzables
│   │   ├── LoginForm.tsx    # Formulari login/register + OAuth
│   │   ├── Dashboard.tsx    # Dashboard principal autenticat
│   │   └── MatchesDashboard.tsx # Historial partides i stats
│   │
│   ├── services/            # API clients i utilities
│   │   └── api.ts          # HTTP client per microserveis
│   │
│   └── utils/              # Helper functions
│
├── public/                 # Assets estàtics
│   ├── index.html         # HTML template principal
│   └── favicon.ico
│
├── package.json           # Dependencies i scripts
├── tailwind.config.js     # Configuració Tailwind
├── vite.config.ts         # Configuració Vite build
└── tsconfig.json          # Configuració TypeScript
```

## 🎨 Components Principals

### **1. App.tsx - Component Root**
```typescript
// Gestiona estat global i routing principal
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto-login al carregar l'app
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Rendering condicional basat en autenticació
  if (!user) return <LoginForm onLoginSuccess={handleLogin} />;
  return <Dashboard user={user} onLogout={handleLogout} />;
};
```

### **2. LoginForm.tsx - Autenticació**
```typescript
// Formulari dual login/register + Google OAuth
const LoginForm: React.FC = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '', email: '', password: ''
  });

  // Modes: Login tradicional / Register / Google OAuth
  const handleSubmit = async (e) => {
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const response = await apiFetch(endpoint, formData);
    if (response.success) onLoginSuccess(response.user);
  };
};
```

### **3. Dashboard.tsx - Interfície Principal**
```typescript
// Dashboard principal per usuaris autenticats
const Dashboard: React.FC = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900">
      <header>/* Navigation amb user info */</header>
      <main>
        <UserProfile user={user} />
        <GameSection />
        <MatchesDashboard />
      </main>
    </div>
  );
};
```

### **4. MatchesDashboard.tsx - Historial**
```typescript
// Component per mostrar historial i estadístiques
const MatchesDashboard: React.FC = () => {
  const [matches, setMatches] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchMatchHistory();
    fetchPlayerStats();
  }, []);

  // Mostra timeline partides + estadístiques
};
```

## 🎯 Funcionalitats Implementades

### ✅ **Autenticació Completa**
- **Login tradicional**: Username/email + password
- **Register**: Validació frontend + backend
- **Google OAuth**: Botó "Sign in with Google"
- **Auto-login**: Persistència sessió amb cookies
- **Logout**: Clear sessió i redirect

### ✅ **Dashboard Interactiu** 
- **User profile**: Info usuari autenticat
- **Navigation**: Menu principal responsiu
- **Real-time updates**: WebSocket connections
- **Responsive design**: Mobile-friendly

### ✅ **Historial Partides**
- **Match timeline**: Llista partides recents
- **Statistics**: Victòries, derrotes, ratios
- **Leaderboard**: Classificació global
- **Filtering**: Per dates, oponents, etc.

## 🌐 Routing (Client-Side)

```typescript
// React Router setup (implicit)
/                    → LoginForm (si no autenticat) | Dashboard (si autenticat)
/login              → Força LoginForm
/dashboard          → Dashboard principal
/profile            → User profile settings
/game/:id           → Game interface (future)
/leaderboard        → Global leaderboard
/matches            → Match history detailed
```

## 🔗 Integració API

### **API Client (services/api.ts)**
```typescript
// Client HTTP centralitzat per tots els microserveis
export const apiFetch = async (endpoint: string, data?: any) => {
  const response = await fetch(`https://localhost${endpoint}`, {
    method: data ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // Include cookies per JWT
    body: data ? JSON.stringify(data) : undefined
  });
  return response.json();
};

// Endpoints utilitzats
apiFetch('/api/auth/login', { username, password });
apiFetch('/api/auth/register', { username, email, password });
apiFetch('/api/auth/profile');  // Auto-login
apiFetch('/api/matches/player/username');  // Match history
apiFetch('/api/matches/stats/username');   // Player stats
```

## 🎨 Styling amb Tailwind

### **Design System**
```css
/* Colors principals */
bg-gradient-to-br from-purple-900 to-blue-900  /* Background principal */
bg-gray-800                                     /* Cards i components */
text-white, text-gray-300                      /* Text colors */

/* Layout responsiu */
min-h-screen         /* Full height */
max-w-md mx-auto     /* Centered containers */
grid grid-cols-1 md:grid-cols-2  /* Responsive grid */

/* Components */
btn-primary: bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg
form-input: bg-gray-700 text-white border border-gray-600 rounded
```

### **Responsive Breakpoints**
```css
sm: 640px    /* Mòbil gran */
md: 768px    /* Tablet */
lg: 1024px   /* Desktop */
xl: 1280px   /* Desktop gran */
```

## ⚙️ Configuració

### **Variables d'Entorn**
```bash
# API Configuration
VITE_API_BASE_URL=https://localhost
VITE_WS_URL=wss://localhost

# OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Build Configuration
VITE_BUILD_MODE=production
```

### **Vite Configuration (vite.config.ts)**
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    https: true,  // Dev amb HTTPS
    proxy: {
      '/api': 'https://localhost'  // Proxy API calls
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

## 🚀 Scripts de Desenvolupament

```bash
# Desenvolupament amb hot reload
npm run dev

# Build per producció
npm run build

# Preview build local
npm run preview

# Linting
npm run lint

# Type checking
npm run type-check
```

## 📱 Responsive Design

### **Mobile First Approach**
```typescript
// Components adaptatius
<div className="
  grid grid-cols-1           // Mobile: 1 columna
  md:grid-cols-2            // Tablet: 2 columnes
  lg:grid-cols-3            // Desktop: 3 columnes
  gap-4 p-4
">
```

### **Touch Friendly**
- **Buttons**: Mida mínima 44px per touch
- **Navigation**: Menu hamburger en mòbil
- **Forms**: Inputs grans i accessible
- **Game controls**: Touch gestures (future)

## 🔒 Seguretat Frontend

### **XSS Prevention**
- **React built-in**: Auto-escape per defecte
- **Sanitize inputs**: Validació client + server
- **Content Security Policy**: Headers del API Gateway

### **Authentication Flow**
```typescript
// JWT storage en httpOnly cookies (més segur que localStorage)
// Auto-refresh tokens transparentment
// Logout automàtic si token expira
```

## 🧪 Testing

```bash
# Unit tests per components
npm run test

# E2E tests amb Cypress
npm run test:e2e

# Visual regression tests
npm run test:visual
```

## 📦 Build i Deployment

### **Desenvolupament Local**
```bash
npm run dev          # http://localhost:3000
```

### **Build Producció**
```bash
npm run build        # Genera dist/ folder
```

### **Docker Deployment**
```dockerfile
# Multi-stage build optimitzat
FROM node:18 AS builder
COPY . .
RUN npm ci && npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

---

**📡 Port desenvolupament**: 3000  
**🎯 Servit via**: API Gateway com a fitxers estàtics  
**🎨 Responsabilitat**: Interfície d'usuari i experiència
