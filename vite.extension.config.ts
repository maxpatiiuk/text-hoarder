/**
 * Vite config for the browser extension (packages/browser-extension/dist/)
 */

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const rootDir = dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig({
  resolve: {
    alias: {
      '@common': path.resolve(rootDir, 'packages/common/src'),
    },
  },
  build: {
    outDir: 'packages/browser-extension/dist',
    emptyOutDir: true,
    minify: false,
    copyPublicDir: false,
    rollupOptions: {
      input: {
        preferences: isDev
          ? 'packages/browser-extension/src/components/Preferences/development.tsx'
          : 'packages/browser-extension/src/components/Preferences/index.tsx',
        background:
          'packages/browser-extension/src/components/Background/index.ts',
        readerMode: isDev
          ? 'packages/browser-extension/src/components/ReaderMode/development.tsx'
          : 'packages/browser-extension/src/components/ReaderMode/index.tsx',
      },
      output: {
        entryFileNames: '[name].bundle.js',
        chunkFileNames: '[name]-[hash].js',
        // CSS is handled via ?inline imports and collected into shadow DOM;
        // prevent Vite from also injecting CSS into document head
        assetFileNames: '[name][extname]',
      },
    },
  },
  plugins: [react()],
});
