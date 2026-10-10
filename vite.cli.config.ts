/**
 * Vite config for the CLI Node.js bundle (packages/cli/dist/cli.bundle.js)
 */

import { builtinModules } from 'node:module';
import { chmodSync, copyFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import path from 'node:path';

const rootDir = dirname(fileURLToPath(import.meta.url));

const version = JSON.parse(
  readFileSync('packages/cli/npm/package.json', 'utf8'),
).version;

export default defineConfig({
  resolve: {
    alias: {
      '@common': path.resolve(rootDir, 'packages/common/src'),
    },
  },
  define: {
    'process.env.TEXT_HOARDER_VERSION': JSON.stringify(version),
  },
  build: {
    target: 'node20',
    outDir: 'packages/cli/dist',
    emptyOutDir: false,
    minify: false,
    copyPublicDir: false,
    lib: {
      entry: 'packages/cli/src/components/Cli/index.ts',
      formats: ['es'],
      fileName: () => 'cli.bundle.js',
    },
    rollupOptions: {
      // Externalize Node.js built-ins (both node: prefixed and bare)
      external: [
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
      ],
    },
  },
  plugins: [
    {
      name: 'cli-post-build',
      buildStart() {
        const configPath = path.resolve(
          rootDir,
          'packages/browser-extension/config.ts',
        );
        if (!existsSync(configPath)) {
          this.error(
            'Missing packages/browser-extension/config.ts. Follow the steps in packages/browser-extension/README.md',
          );
        }
      },
      writeBundle() {
        // Make the bundle executable
        chmodSync('packages/cli/dist/cli.bundle.js', 0o755);
        // Copy files needed at runtime alongside the bundle
        copyFileSync(
          'packages/cli/src/components/Spam/exclude-list.txt',
          'packages/cli/dist/exclude-list.txt',
        );
        copyFileSync(
          'packages/cli/npm/package.json',
          'packages/cli/dist/package.json',
        );
        copyFileSync('docs/cli.md', 'packages/cli/dist/README.md');
        // Copy xdg-open so the `open` package can find it at runtime.
        // open uses import.meta.url to locate xdg-open relative to itself;
        // since we bundle open into cli.bundle.js, xdg-open must sit next to
        // the bundle in dist/.
        copyFileSync(
          'node_modules/open/xdg-open',
          'packages/cli/dist/xdg-open',
        );
      },
    },
  ],
});
