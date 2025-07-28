import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log('🚀 main.tsx loading...');

const rootElement = document.getElementById('root');
console.log('📍 Root element:', rootElement);

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement as HTMLElement);
  console.log('⚡ React root created, rendering App...');
  root.render(
    <App />
  );
  console.log('✅ App rendered successfully');
} else {
  console.error('❌ Root element not found!');
}
