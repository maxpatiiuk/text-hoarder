/**
 * Vite config for the ReaderMode content script.
 *
 * ReaderMode is injected into pages via chrome.scripting.executeScript, which
 * always loads files as classic scripts (no ES module support). A single-entry
 * IIFE build produces a fully self-contained bundle with no import statements.
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
    emptyOutDir: false,
    minify: false,
    copyPublicDir: false,
    rollupOptions: {
      input: isDev
        ? 'packages/browser-extension/src/components/ReaderMode/development.tsx'
        : 'packages/browser-extension/src/components/ReaderMode/index.tsx',
      output: {
        format: 'iife',
        entryFileNames: 'readerMode.bundle.js',
        assetFileNames: '[name][extname]',
      },
    },
  },
  plugins: [react()],
});
