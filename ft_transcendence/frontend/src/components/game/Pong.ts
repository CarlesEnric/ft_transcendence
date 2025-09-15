// import * as BABYLON from "@babylonjs/core";

// export const initPongGame = (): void => {
//   const container = document.getElementById('pongContainer')!;
  
//   // Crear canvas para Babylon.js
//   const canvas = document.createElement('canvas');
//   canvas.style.width = '100%';
//   canvas.style.height = '400px';
//   container.appendChild(canvas);

//   // Inicializar motor Babylon.js
//   const engine = new BABYLON.Engine(canvas, true);
//   const scene = new BABYLON.Scene(engine);

//   // Configurar cámara
//   const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
//   camera.setTarget(BABYLON.Vector3.Zero());
//   camera.attachControl(canvas, true); // ✅ Cambiar attachControls por attachControl

//   // ...existing code...
//   // Configurar luz
//   const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
//   light.intensity = 0.7;

//   // Crear elementos del juego (pelota, paletas, etc.)
//   const ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 0.5 }, scene);
//   const paddleLeft = BABYLON.MeshBuilder.CreateBox("paddleLeft", { width: 0.2, height: 2, depth: 0.2 }, scene);
//   const paddleRight = BABYLON.MeshBuilder.CreateBox("paddleRight", { width: 0.2, height: 2, depth: 0.2 }, scene);

//   // Posicionar elementos
//   paddleLeft.position.x = -8;
//   paddleRight.position.x = 8;
//   ball.position.set(0, 0, 0);

//   // WebSocket para comunicación en tiempo real
//   const socket = new WebSocket('wss://localhost:8080/ws/game');
  
//   socket.onopen = () => {
//     console.log('🔗 Connected to game server');
//   };

//   socket.onmessage = (event) => {
//     const data = JSON.parse(event.data);
//     // Actualizar posiciones basándose en el estado del servidor
//     if (data.ball) {
//       ball.position.x = data.ball.x;
//       ball.position.z = data.ball.z;
//     }
//     if (data.paddles) {
//       paddleLeft.position.z = data.paddles.left;
//       paddleRight.position.z = data.paddles.right;
//     }
//   };

//   // Control de teclado
//   const handleKeyDown = (event: KeyboardEvent) => {
//     let message = null;
    
//     switch (event.key) {
//       case 'w':
//       case 'W':
//         message = { type: 'move', player: 'right', direction: 'up' };
//         break;
//       case 's':
//       case 'S':
//         message = { type: 'move', player: 'right', direction: 'down' };
//         break;
//       case 'ArrowUp':
//         message = { type: 'move', player: 'left', direction: 'up' };
//         break;
//       case 'ArrowDown':
//         message = { type: 'move', player: 'left', direction: 'down' };
//         break;
//     }

//     if (message && socket.readyState === WebSocket.OPEN) {
//       socket.send(JSON.stringify(message));
//     }
//   };

//   window.addEventListener('keydown', handleKeyDown);

//   // Render loop
//   engine.runRenderLoop(() => {
//     scene.render();
//   });

//   // Cleanup al cambiar de página
//   window.addEventListener('beforeunload', () => {
//     socket.close();
//     window.removeEventListener('keydown', handleKeyDown);
//     engine.dispose();
//   });
// };
import * as BABYLON from "@babylonjs/core";

export const initPongGame = (): void => {
  const container = document.getElementById('pongContainer')!;
  
  // Limpiar contenedor
  container.innerHTML = '';
  
  // Crear canvas para Babylon.js
  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '400px';
  container.appendChild(canvas);

  // Inicializar motor Babylon.js
  const engine = new BABYLON.Engine(canvas, true);
  const scene = new BABYLON.Scene(engine);

  // Configurar cámara
  const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
  camera.setTarget(BABYLON.Vector3.Zero());
  camera.attachControl(canvas, true);

  // Configurar luz
  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.7;

  // Crear elementos del juego
  const ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 0.5 }, scene);
  const paddleLeft = BABYLON.MeshBuilder.CreateBox("paddleLeft", { width: 0.2, height: 2, depth: 0.2 }, scene);
  const paddleRight = BABYLON.MeshBuilder.CreateBox("paddleRight", { width: 0.2, height: 2, depth: 0.2 }, scene);

  // Posicionar elementos
  paddleLeft.position.x = -8;
  paddleRight.position.x = 8;
  ball.position.set(0, 0, 0);

  // ✅ JUEGO LOCAL SIN WEBSOCKET
  // Variables del juego
  let ballVelocity = { x: 0.1, z: 0.08 };
  let leftPaddleY = 0;
  let rightPaddleY = 0;
  const paddleSpeed = 0.15;

  // Control de teclado LOCAL
  const keys: { [key: string]: boolean } = {};

  const handleKeyDown = (event: KeyboardEvent) => {
    keys[event.key.toLowerCase()] = true;
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    keys[event.key.toLowerCase()] = false;
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  // Game loop
  const gameLoop = () => {
    // Movimiento de paletas
    if (keys['arrowup'] && leftPaddleY > -3) {
      leftPaddleY -= paddleSpeed;
    }
    if (keys['arrowdown'] && leftPaddleY < 3) {
      leftPaddleY += paddleSpeed;
    }
    if (keys['w'] && rightPaddleY > -3) {
      rightPaddleY -= paddleSpeed;
    }
    if (keys['s'] && rightPaddleY < 3) {
      rightPaddleY += paddleSpeed;
    }

    // Actualizar posiciones de paletas
    paddleLeft.position.z = leftPaddleY;
    paddleRight.position.z = rightPaddleY;

    // Movimiento de la pelota
    ball.position.x += ballVelocity.x;
    ball.position.z += ballVelocity.z;

    // Colisiones con bordes superior/inferior
    if (ball.position.z > 4 || ball.position.z < -4) {
      ballVelocity.z *= -1;
    }

    // Colisiones con paletas
    if (ball.position.x < -7.5 && 
        ball.position.z > leftPaddleY - 1 && 
        ball.position.z < leftPaddleY + 1) {
      ballVelocity.x *= -1.1; // Aumentar velocidad
    }

    if (ball.position.x > 7.5 && 
        ball.position.z > rightPaddleY - 1 && 
        ball.position.z < rightPaddleY + 1) {
      ballVelocity.x *= -1.1;
    }

    // Reset si la pelota sale de los límites
    if (ball.position.x < -10 || ball.position.x > 10) {
      ball.position.set(0, 0, 0);
      ballVelocity = { x: Math.random() > 0.5 ? 0.1 : -0.1, z: 0.05 };
    }
  };

  // Render loop
  engine.runRenderLoop(() => {
    gameLoop();
    scene.render();
  });

  // Cleanup al cambiar de página
  const cleanup = () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    engine.dispose();
  };

  window.addEventListener('beforeunload', cleanup);
  
  // Cleanup cuando se navega a otra página
  window.addEventListener('popstate', cleanup);

  console.log('🎮 Pong game initialized successfully!');
  console.log('🕹️ Controls: Arrow Keys (Left Player) | W/S (Right Player)');
};