import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'src/db/migrations/**',
      'src/db/seeders/**',
      'src/config/db.js',
      'coverage/**',
      '*.config.js',
      '*.config.cjs',
      '*.config.mjs',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  prettierConfig,

  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      import: importPlugin,
    },

    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },

    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        setInterval: 'readonly',
        setTimeout: 'readonly',
        clearInterval: 'readonly',
        clearTimeout: 'readonly',
      },
    },

    rules: {
      // ─── Correctness (errors) ────────────────────────────────────────────
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-throw-literal': 'off',
      '@typescript-eslint/only-throw-error': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/return-await': ['error', 'in-try-catch'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      'no-duplicate-imports': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      'no-param-reassign': ['error', { props: false }],
      'object-shorthand': ['error', 'always'],
      'prefer-arrow-callback': 'error',
      '@typescript-eslint/no-shadow': 'error',

      // ─── Import ordering & hygiene ───────────────────────────────────────
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Side-effect imports first
            ['^\\u0000'],
            // Node built-ins
            ['^node:'],
            // External packages
            ['^@?\\w'],
            // Internal absolute (none for now, but ready)
            ['^@/'],
            // Parent imports
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            // Same folder
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            // Style imports
            ['^.+\\.s?css$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',

      // ─── Style (warnings) ────────────────────────────────────────────────
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/array-type': ['warn', { default: 'array' }],
      '@typescript-eslint/consistent-type-definitions': ['warn', 'interface'],
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      'prefer-template': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      curly: ['error', 'multi-line'],
    },
  },

  // Loosen rules in test files
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
);
