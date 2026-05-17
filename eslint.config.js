import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'tests/**', 'test/**', 'minhavenda-course/**']),
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.es2020,
        React: 'readonly',
        NodeJS: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        varsIgnorePattern: '^[A-Z_]',
        argsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  // Utility/context files that intentionally mix components and non-component exports
  // Fast Refresh still works fine — these are never hot-reloaded as leaf components
  {
    files: [
      'src/utils/adminUtils.tsx',
      'src/components/common/Toast.tsx',
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  // playwright.config.js runs in Node — needs `process` and other Node globals
  {
    files: ['playwright.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
])
