// Rutes SPA (només accessibles si estàs autenticat)
const routes: Record<string, (user: any) => string> = {
  '/home': (user) => `
    <h1>Benvingut a la Home!</h1>
    <p>Aquesta és la pàgina principal.</p>
  `,
  '/about': (user) => `
    <h1>About</h1>
    <p>Informació sobre el projecte i l'equip.</p>
  `,
  '/games': (user) => `
    <h1>Zona de Jocs</h1>
    <p>Accedeix als diferents jocs disponibles.</p>
  `,
  '/tournament': (user) => `
    <h1>Torneig</h1>
    <p>Participa o consulta els torneigs en curs.</p>
  `,
  '/profile': (user) => `
    <h1>Perfil d'usuari</h1>
    <p>Nom: ${user.name}</p>
    <p>Email: ${user.email}</p>
    <button id="logout">Logout</button>
  `
};

// Comprova autenticació
async function isAuthenticated(): Promise<any | null> {
  try {
    const res = await fetch('/auth/api/me', { credentials: 'include' });
    if (res.ok) return await res.json();
  } catch {}
  return null;
}

// Render principal
async function render(path = window.location.pathname) {
  const app = document.getElementById('app');
  if (!app) return;

  const user = await isAuthenticated();

  if (!user) {
    // Mostra només login/registre
    app.innerHTML = `
      <h1>Benvingut!</h1>
      <a href="/auth/login/google">Login amb Google</a>
      <p>O <a href="#" id="show-register">Registra't manualment</a></p>
      <div id="register-form" class="hidden">
        <form id="register">
          <input type="text" name="name" placeholder="Nom" required />
          <input type="email" name="email" placeholder="Email" required />
          <input type="password" name="password" placeholder="Password" required />
          <button type="submit">Registra't</button>
        </form>
      </div>
    `;
    // Mostra el formulari de registre si es clica
    document.getElementById('show-register')?.addEventListener('click', e => {
      e.preventDefault();
      document.getElementById('register-form')!.classList.remove('hidden')
    });

    // Handler de registre
    document.getElementById('register')?.addEventListener('submit', async e => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const data = Object.fromEntries(new FormData(form));
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) window.location.reload();
      else alert('Error al registrar');
    });
    return;
  }
  // Si està autenticat i està a /, redirigeix a /home
  if (path === '/') {
    window.history.replaceState({}, '', '/home');
    path = '/home';
  }

  // Si està autenticat, mostra la SPA normal
  renderSPA(path, user);
}

// Renderitza la SPA (només si autenticat)
function renderSPA(path: string, user: any) {
  const app = document.getElementById('app');
  if (!app) return;

  // Navegació
  app.innerHTML = `
    <nav>
      <a href="/home" data-link>Home</a>
      <a href="/about" data-link>About</a>
      <a href="/games" data-link>Jocs</a>
      <a href="/tournament" data-link>Torneig</a>
      <a href="/profile" data-link>Perfil</a>
      <span> | Hola, ${user.name} <button id="logout">Logout</button></span>
    </nav>
    <div id="spa-content"></div>
  `;

  // Renderitza la vista SPA
  const spaContent = document.getElementById('spa-content');
  if (routes[path]) {
    spaContent!.innerHTML = routes[path](user);
  } else {
    spaContent!.innerHTML = `<h1>404 Not Found</h1>`;
  }

  // SPA navigation
  document.querySelectorAll('a[data-link]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const href = (e.target as HTMLAnchorElement).getAttribute('href')!;
      window.history.pushState({}, '', href);
      renderSPA(href, user);
    });
  });

  // Logout
  document.getElementById('logout')?.addEventListener('click', () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.history.pushState({}, '', '/');
    render('/');
  });
}

// SPA navigation amb back/forward
window.onpopstate = () => render(window.location.pathname);
window.onload = () => render(window.location.pathname);