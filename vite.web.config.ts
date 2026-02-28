/**
 * Vite config for the browser-side stats bundle served by the CLI
 * (packages/cli/dist/web.bundle.js)
 */

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJs from 'vite-plugin-css-injected-by-js';
import path from 'node:path';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@common': path.resolve(rootDir, 'packages/common/src'),
    },
  },
  build: {
    outDir: 'packages/cli/dist',
    emptyOutDir: false,
    minify: false,
    copyPublicDir: false,
    lib: {
      entry: 'packages/cli/src/components/Web/index.tsx',
      formats: ['iife'],
      name: 'TextHoarderWeb',
      fileName: () => 'web.bundle.js',
    },
  },
  plugins: [
    react(),
    // Inline CSS into the JS bundle so the stats page works as a single file
    cssInjectedByJs(),
  ],
});
