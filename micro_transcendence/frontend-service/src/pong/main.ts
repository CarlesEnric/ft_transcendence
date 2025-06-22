import * as BABYLON from 'babylonjs';

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

const paddle1 = BABYLON.MeshBuilder.CreateBox('paddle1', { width: 0.2, height: 1, depth: 0.2 }, scene);
paddle1.position.x = -2;
const paddle2 = BABYLON.MeshBuilder.CreateBox('paddle2', { width: 0.2, height: 1, depth: 0.2 }, scene);
paddle2.position.x = 2;
const ball = BABYLON.MeshBuilder.CreateSphere('ball', { diameter: 0.2 }, scene);

const camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 0, -10), scene);
camera.setTarget(BABYLON.Vector3.Zero());

engine.runRenderLoop(() => scene.render());

let myPlayer = 1;

const socket = new WebSocket('wss://localhost:8000/game');

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
    // Pots mostrar puntuació amb un element HTML
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