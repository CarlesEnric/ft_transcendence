import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  server: {
    port: 443,
    host: true,
    https: {
      key: './ssl/key.pem',
      cert: './ssl/cert.pem',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          babylon: ['@babylonjs/core', '@babylonjs/materials'],
          qrcode: ['qrcode'],
          speakeasy: ['speakeasy'],
        },
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
});
