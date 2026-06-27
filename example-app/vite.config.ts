import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const releasePath = (process.env.VITE_CAPGO_APP_LABEL ?? 'bundle').replace(/[^a-zA-Z0-9-_]/g, '-');

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@capgo/cordova-updater': path.resolve(rootDir, '../dist/esm/index.js'),
    },
  },
  server: {
    open: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: `assets/${releasePath}/[name].js`,
        chunkFileNames: `assets/${releasePath}/[name].js`,
        assetFileNames: `assets/${releasePath}/[name][extname]`,
      },
    },
  },
});
