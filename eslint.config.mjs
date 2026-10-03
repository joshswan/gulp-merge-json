import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier/recommended';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

export default defineConfig(
  { ignores: ['coverage/'] },
  js.configs.recommended,
  prettier,
  {
    files: ['**/*.js'],
    languageOptions: { globals: globals.node, sourceType: 'commonjs' },
  },
  {
    files: ['test/**'],
    languageOptions: { globals: globals.jest },
  },
);
