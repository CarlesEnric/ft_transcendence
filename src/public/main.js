function render() {
  const app = document.getElementById('app');
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

function navigate(event, path) {
  event.preventDefault();
  window.history.pushState({}, '', path);
  render();
}

// Check if user is authenticated by calling a protected API
function checkAuth() {
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



// MAIN.TS
// function render() {
//   const app = document.getElementById('app');
//   if (!app) {
//     console.error('App element not found');
//     return;
//   }
  
//   switch (window.location.pathname) {
//     case '/':
//       app.innerHTML = `
//         <h1>Welcome to Fastify OAuth2 SPA</h1>
//         <a href="/login/google">Login with Google</a>
//         <div id="status"></div>
//       `;
//       checkAuth();
//       break;
//     case '/login/success':
//       app.innerHTML = `
//         <h1>Login Successful!</h1>
//         <a href="/" onclick="navigate(event, '/')">Go Home</a>
//       `;
//       checkAuth();
//       break;
//     case '/login/failure':
//       app.innerHTML = `
//         <h1>Login Failed!</h1>
//         <a href="/" onclick="navigate(event, '/')">Go Home</a>
//       `;
//       break;
//     default:
//       app.innerHTML = `<h1>404 Not Found</h1>`;
//   }
// }

// function navigate(event: Event, path: string): void {
//   // Prevent default link behavior and update the URL
//   event.preventDefault();
//   // Use the History API to change the URL without reloading
//   window.history.pushState({}, '', path);
//   // Call render to update the view
//   render();
// }

// // Check if user is authenticated by calling a protected API
// function checkAuth(): void {
//   fetch('/api/me', { credentials: 'include' })
//     .then(res => res.ok ? res.json() : null)
//     .then(user => {
//       const status = document.getElementById('status');
//       if (status) {
//         if (user && user.email) {
//           status.innerHTML = `<p>Logged in as: ${user.email}</p>`;
//         } else {
//           status.innerHTML = `<p>Not logged in.</p>`;
//         }
//       }
//     });
// }

// // Handle navigation events
// window.onpopstate = render;
// // Handle initial page load
// window.onload = render;