/**
 * WebPack config for development and production
 */

import path from 'node:path';
import webpack from 'webpack';
import fs from 'fs';
import { fileURLToPath } from 'node:url';
import ShebangPlugin from 'webpack-shebang-plugin';
import CopyPlugin from 'copy-webpack-plugin';

const version = JSON.parse(
  fs.readFileSync('packages/browser-extension/manifest.json', 'utf8'),
).version;

export default function (_, { mode }) {
  const cwd = process.env.INIT_CWD ?? process.cwd();
  const pathParts = cwd.split(path.sep);
  const packagesPathPart = pathParts.indexOf('packages');
  const packageName = pathParts[packagesPathPart + 1];
  if (packageName === undefined)
    throw new Error(`Unable to resolve package name from cwd (${cwd})`);
  return packageName === 'browser-extension'
    ? makeConfig(packageName, mode)
    : [
        makeConfig(packageName, mode, 'node'),
        makeConfig(packageName, mode, 'web'),
      ];
}

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));

function makeConfig(packageName, mode, target = 'web') {
  const outputPath = path.resolve(
    rootDirectory,
    'packages',
    packageName,
    'dist',
  );
  return /** @type { import('webpack').Configuration } */ ({
    target,
    module: {
      rules: [
        {
          test: /\.(png|gif|jpg|jpeg|svg)$/,
          type: 'asset',
        },
        {
          test: /\.css$/,
          use: [
            {
              // See https://stackoverflow.com/a/68995851/8584605
              loader: 'style-loader',
              options:
                packageName === 'browser-extension'
                  ? {
                      insert: path.resolve(
                        rootDirectory,
                        './packages/browser-extension/src/components/Core/styleLoader.ts',
                      ),
                    }
                  : undefined,
            },
            'css-loader',
            'postcss-loader',
          ],
        },
        {
          test: /\.[tj]sx?$/,
          exclude: /(node_modules)/,
          use: [
            {
              loader: 'babel-loader?+cacheDirectory',
              options: {
                presets: [
                  [
                    '@babel/preset-env',
                    {
                      useBuiltIns: 'usage',
                      corejs: {
                        version: '3.33.0',
                        proposals: true,
                      },
                      bugfixes: true,
                      // See "browserslist" section of package.json
                      browserslistEnv: mode,
                    },
                  ],
                  ['@babel/preset-react'],
                  ['@babel/preset-typescript'],
                ],
              },
            },
          ],
        },
      ],
    },
    resolve: {
      // Workaround for https://github.com/laurent22/joplin/issues/9884
      fallback: {
        fs: false,
        path: false,
        url: false,
      },
      extensions: ['.ts', '.tsx', '.js'],
      symlinks: false,
      alias: {
        '@common': path.resolve(rootDirectory, 'packages/common/src'),
      },
    },
    // Set appropriate process.env.NODE_ENV
    mode: mode,
    /*
     * User recommended source map type in production
     * Can't use the recommended "eval-source-map" in development due to
     * https://stackoverflow.com/questions/48047150/chrome-extension-compiled-by-webpack-throws-unsafe-eval-error
     */
    devtool: mode === 'development' ? 'cheap-module-source-map' : 'source-map',
    entry:
      packageName === 'browser-extension'
        ? {
            preferences:
              mode === 'development'
                ? './packages/browser-extension/src/components/Preferences/development.tsx'
                : './packages/browser-extension/src/components/Preferences/index.tsx',
            background:
              './packages/browser-extension/src/components/Background/index.ts',
            readerMode:
              mode === 'development'
                ? './packages/browser-extension/src/components/ReaderMode/development.tsx'
                : './packages/browser-extension/src/components/ReaderMode/index.tsx',
          }
        : target === 'web'
          ? {
              web: './packages/cli/src/components/Web/index.tsx',
            }
          : {
              cli: './packages/cli/src/components/Cli/index.ts',
            },
    plugins: [
      mode === 'development'
        ? new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1,
          })
        : undefined,
      target === 'node' ? new ShebangPlugin() : undefined,
      target === 'node' && packageName === 'cli'
        ? new CopyPlugin({
            patterns: [
              path.resolve(
                rootDirectory,
                'packages/cli/src/components/Spam/exclude-list.txt',
              ),
            ],
          })
        : undefined,
      new webpack.DefinePlugin({
        'process.env.TEXT_HOARDER_VERSION': JSON.stringify(version),
      }),
    ],
    experiments: {
      outputModule: true,
    },
    output: {
      path: outputPath,
      publicPath: '/public/',
      filename: '[name].bundle.js',
      chunkFormat: target === 'node' ? 'module' : undefined,
      library:
        target === 'node'
          ? {
              type: 'module',
            }
          : undefined,
      environment: {
        arrowFunction: true,
        const: true,
        destructuring: true,
        bigIntLiteral: true,
        forOf: true,
        dynamicImport: true,
        module: true,
        optionalChaining: true,
        templateLiteral: true,
      },
    },
    watchOptions: {
      ignored: '**/node_modules/',
    },
    optimization: {
      minimize: false,
    },
    performance: {
      // Disable bundle size warnings for bundles <2 MB
      maxEntrypointSize: 2 * 1024 * 1024,
      maxAssetSize: 2 * 1024 * 1024,
    },
    stats: {
      env: true,
      outputPath: true,
      warnings: true,
      errors: true,
      errorDetails: true,
      errorStack: true,
      moduleTrace: true,
      timings: true,
    },
  });
}
