const API = {
  register: '/register',
  login: '/login',
  logout: '/logout',
  me: '/api/me',
  google: '/auth/login/google'
};

const appRoutes: Record<string, (user: any) => string> = {
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
  `
};

async function isAuthenticated(): Promise<any | null> {
  try {
    const res = await fetch(API.me, { credentials: 'include' });
    if (res.ok) return await res.json();
  } catch {}
  return null;
}

function showForm(formIdToShow: string, formIdToHide: string) {
  document.getElementById(formIdToShow)?.classList.remove('hidden');
  document.getElementById(formIdToHide)?.classList.add('hidden');
}

async function submitForm(url: string, data: any) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  return res;
}

async function render(path = window.location.pathname) {
  const app = document.getElementById('app');
  if (!app) return;

  const user = await isAuthenticated();

  if (!user) {
    app.innerHTML = `
      <h1>Benvingut!</h1>
      <a href="${API.google}">Login amb Google</a>
      <p>O <a href="#" id="show-register">Registra't manualment</a> | <a href="#" id="show-login">Login manual</a></p>
      <div id="register-form" class="hidden">
        <form id="register">
          <input type="text" name="name" placeholder="Nom" required />
          <input type="email" name="email" placeholder="Email" required />
          <input type="password" name="password" placeholder="Password" required />
          <button type="submit">Registra't</button>
        </form>
      </div>
      <div id="login-form" class="hidden">
        <form id="login">
          <input type="email" name="email" placeholder="Email" required />
          <input type="password" name="password" placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
      </div>
    `;

    document.getElementById('show-register')?.addEventListener('click', e => {
      e.preventDefault();
      showForm('register-form', 'login-form');
    });

    document.getElementById('show-login')?.addEventListener('click', e => {
      e.preventDefault();
      showForm('login-form', 'register-form');
    });

    document.getElementById('register')?.addEventListener('submit', async e => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const data = Object.fromEntries(new FormData(form));
      const res = await submitForm(API.register, data);
      if (res.ok) window.location.href = '/home';
      else {
        const err = await res.json().catch(() => ({}));
        alert('Error al registrar: ' + (err.error || ''));
      }
    });

    document.getElementById('login')?.addEventListener('submit', async e => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const data = Object.fromEntries(new FormData(form));
      const res = await submitForm(API.login, data);
      if (res.ok) window.location.href = '/home';
      else {
        const err = await res.json().catch(() => ({}));
        alert('Error al fer login: ' + (err.error || ''));
      }
    });
    return;
  }

  if (path === '/') {
    window.history.replaceState({}, '', '/home');
    path = '/home';
  }

  renderSPA(path, user);
}

function renderSPA(path: string, user: any) {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <nav>
      <a href="/home" data-link>Home</a>
      <a href="/about" data-link>About</a>
      <a href="/games" data-link>Jocs</a>
      <a href="/tournament" data-link>Torneig</a>
      <a href="/profile" data-link>Perfil</a>
      <span> | Hola, ${user.name} <button id="logout" class="button">Logout</button></span>
    </nav>
    <div id="spa-content"></div>
  `;

  const spaContent = document.getElementById('spa-content');
  if (appRoutes[path]) {
    spaContent!.innerHTML = appRoutes[path](user);
  } else {
    spaContent!.innerHTML = `<h1>404 Not Found</h1>`;
  }

  document.querySelectorAll('a[data-link]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const href = (e.target as HTMLAnchorElement).getAttribute('href')!;
      window.history.pushState({}, '', href);
      renderSPA(href, user);
    });
  });

  document.getElementById('logout')?.addEventListener('click', async () => {
    await fetch(API.logout, { method: 'POST', credentials: 'include' });
    window.history.pushState({}, '', '/');
    render('/');
  });
}

window.onpopstate = () => render(window.location.pathname);
window.onload = () => render(window.location.pathname);