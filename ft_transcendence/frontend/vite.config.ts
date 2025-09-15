import { defineConfig } from 'vite';
import fs from 'fs';

// Llegim directament del fitxer .env
function getEnvVars() {
  try {
    const envFile = fs.readFileSync('./frontend/.env', 'utf8');
    const vars = {};
    envFile.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        vars[match[1]] = match[2] || '';
      }
    });
    return vars;
  } catch (e) {
    console.error('Error al llegir .env:', e);
    return { VITE_HOST_IP: '192.168.1.56' };
  }
}

const envVars = getEnvVars();
console.log('🔧 Building with HOST_IP:', envVars.VITE_HOST_IP);

export default defineConfig({
  plugins: [],
  server: {
    port: 443,
    host: true,
    https: {
      key: './ssl/key.pem',
      cert: './ssl/cert.pem',
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          babylon: ['@babylonjs/core', '@babylonjs/materials'],
          qrcode: ['qrcode'],
          speakeasy: ['speakeasy']
        },
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    // Injectem la variable d'entorn VITE_HOST_IP directament
    'import.meta.env.VITE_HOST_IP': JSON.stringify(envVars.VITE_HOST_IP || '192.168.1.56')
  }
});
