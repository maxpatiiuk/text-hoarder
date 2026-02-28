import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@common': path.resolve(rootDir, 'packages/common/src'),
    },
  },
});
