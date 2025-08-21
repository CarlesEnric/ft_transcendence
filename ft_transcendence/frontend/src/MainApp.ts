/**
 * Main entry point - SPA Vanilla TypeScript
 */
import './index.css';
import { App } from './GameEngine';

console.log('🚀 MainApp.ts loading...');

const rootElement = document.getElementById('root');
console.log('📍 Root element:', rootElement);

if (rootElement) {
  console.log('⚡ Initializing SPA...');
  const app = new App();
  app.mount(rootElement);
  console.log('✅ App initialized successfully');
} else {
  console.error('❌ Root element not found!');
}
