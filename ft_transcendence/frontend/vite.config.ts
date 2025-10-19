import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      //  Eliminar la línea input, Vite buscará index.html automáticamente en la raíz
      output: {
        manualChunks: {
          babylon: ['@babylonjs/core', '@babylonjs/materials'],
          socket: ['socket.io-client'],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
    // Temporalmente sin HTTPS
    // https: {
    //   key: '../ssl/key.pem',
    //   cert: '../ssl/cert.pem',
    // },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
});