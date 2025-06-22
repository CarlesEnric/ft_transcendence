import * as BABYLON from 'babylonjs';

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

// Crea paletes i pilota (exemple molt simple)
const paddle1 = BABYLON.MeshBuilder.CreateBox('paddle1', { width: 0.2, height: 1, depth: 0.2 }, scene);
paddle1.position.x = -2;
const paddle2 = BABYLON.MeshBuilder.CreateBox('paddle2', { width: 0.2, height: 1, depth: 0.2 }, scene);
paddle2.position.x = 2;
const ball = BABYLON.MeshBuilder.CreateSphere('ball', { diameter: 0.2 }, scene);

const camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 0, -10), scene);
camera.setTarget(BABYLON.Vector3.Zero());

engine.runRenderLoop(() => scene.render());

// Connexió WebSocket
const socket = new WebSocket('wss://localhost:8000/game');

socket.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === 'welcome') {
    // Assigna jugador (1 o 2)
    console.log('Ets el jugador', msg.player);
  }
  // Aquí pots rebre moviments de l’altre jugador i actualitzar paddle2/bal
};

// Envia moviments al backend
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    socket.send(JSON.stringify({ type: 'move', key: e.key }));
  }
});