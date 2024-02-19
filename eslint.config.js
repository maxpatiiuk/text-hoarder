import eslintConfig from '@maxxxxxdlp/eslint-config';
import eslintConfigReact from '@maxxxxxdlp/eslint-config-react';
import globals from 'globals';

export default [
  ...eslintConfig,
  ...eslintConfigReact,
  {
    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-empty-interface': 'off',
    },
  },
];
