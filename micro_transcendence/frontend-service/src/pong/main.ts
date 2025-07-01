import * as BABYLON from 'babylonjs';

// Funció per obtenir el token JWT de la cookie
function getCookie(name: string) {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='))
    ?.split('=')[1];
}

// Inicialitza Babylon.js només si el canvas existeix
const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement | null;
if (!canvas) {
  console.error('No s\'ha trobat el canvas!');
} else {
  const engine = new BABYLON.Engine(canvas, true);
  const scene = new BABYLON.Scene(engine);

  // Paletes i pilota
  const paddle1 = BABYLON.MeshBuilder.CreateBox('paddle1', { width: 0.2, height: 1, depth: 0.2 }, scene);
  paddle1.position.x = -2;
  const paddle2 = BABYLON.MeshBuilder.CreateBox('paddle2', { width: 0.2, height: 1, depth: 0.2 }, scene);
  paddle2.position.x = 2;
  const ball = BABYLON.MeshBuilder.CreateSphere('ball', { diameter: 0.2 }, scene);

  // Càmera
  const camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 0, -10), scene);
  camera.setTarget(BABYLON.Vector3.Zero());

  engine.runRenderLoop(() => scene.render());

  let myPlayer = 1;

  // Obté el token i connecta al WebSocket
  const token = getCookie('token');
  if (!token) {
    alert('No s\'ha trobat el token d\'autenticació. Torna a iniciar sessió.');
    throw new Error('Token JWT no trobat');
  }
  const socket = new WebSocket(`wss://localhost:8000/game?token=${token}`);

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === 'welcome') {
      myPlayer = msg.player;
    }
    if (msg.type === 'state') {
      paddle1.position.y = msg.paddle1.y;
      paddle2.position.y = msg.paddle2.y;
      ball.position.x = msg.ball.x;
      ball.position.y = msg.ball.y;
      // Aquí pots mostrar la puntuació amb un element HTML si vols
    }
  };

  window.addEventListener('keydown', (e) => {
    if (myPlayer === 1 && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      socket.send(JSON.stringify({ type: 'move', direction: e.key === 'ArrowUp' ? 'up' : 'down' }));
    }
    if (myPlayer === 2 && (e.key === 'w' || e.key === 's')) {
      socket.send(JSON.stringify({ type: 'move', direction: e.key === 'w' ? 'up' : 'down' }));
    }
  });
}