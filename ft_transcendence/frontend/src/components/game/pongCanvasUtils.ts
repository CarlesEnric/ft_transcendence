// Utilitat per crear i redimensionar el canvas Pong de manera responsive
export function createResponsivePongCanvas(pongContainer: HTMLElement): HTMLCanvasElement {
  // Crear canvas
  const canvas = document.createElement('canvas');
  // Assigna id gameCanvas si el mode és online/tournament
  const mode = (window as any).app?.getGameMode?.() || '';
  if (mode === 'online' || mode === 'tournament') {
    canvas.id = 'gameCanvas';
  }
  // Funció per redimensionar el canvas (Responsive)
  function resizeCanvas() {
    if (!pongContainer) return;
    const minWidth = 320;
    const minHeight = 240;
    // Get container dimensions from computed styles to ensure it's rendered
    const rect = pongContainer.getBoundingClientRect();
    const containerWidth = Math.max(rect.width, pongContainer.clientWidth, minWidth);
    const containerHeight = Math.max(rect.height, pongContainer.clientHeight, minHeight);
    
    canvas.width = containerWidth;
    canvas.height = containerHeight;
  }
  resizeCanvas();
  
  // Recalculate on window resize and orientation change
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 100);
  });
  
  canvas.style.display = 'block';
  canvas.style.cursor = 'none';
  canvas.style.borderRadius = '20px';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.backgroundColor = '#1a202c';

  pongContainer.appendChild(canvas);
  return canvas;
}
