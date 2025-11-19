import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import noFloatingPromise from 'eslint-plugin-no-floating-promise';
import unusedImports from 'eslint-plugin-unused-imports';
import { defineConfig, globalIgnores } from 'eslint/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores([
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/*.spec.ts',
    '**/*.spec.tsx',
    '**/vitest.config.ts',
    '**/*.md',
    '**/node_modules/',
    '**/.next/',
    '**/public/',
    '**/dist/',
    '**/node_modules',
    '**/.next',
    '**/dist',
    '**/public',
    '**/*.md',
    '**/*.json',
    '**/*.svg',
    '**/*.log',
    '**/*.lock',
    '**/*.env',
    '**/*.env.*',
    '**/coverage',
    'next-env.d.ts',
  ]),
  {
    extends: fixupConfigRules(
      compat.extends(
        'next',
        'next/core-web-vitals',
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'prettier',
      ),
    ),

    plugins: {
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
      'unused-imports': unusedImports,
      'no-floating-promise': noFloatingPromise,
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },

    settings: {
      'import/resolver': {
        typescript: {},
      },
    },

    rules: {
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
        },
      ],

      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-floating-promise/no-floating-promise': 2,
      'prefer-const': 'error',
      'no-empty-function': 'error',
      'object-shorthand': ['error', 'always'],
      'react/react-in-jsx-scope': 'off',
      'no-console': 'error',
      'no-debugger': 'error',
      'import/no-unresolved': 'off',
      'unused-imports/no-unused-imports': 'error',

      'no-multiple-empty-lines': [
        'warn',
        {
          max: 1,
          maxEOF: 0,
        },
      ],

      'no-trailing-spaces': 'warn',
      'eol-last': ['warn', 'always'],
      indent: 'off',
      'no-duplicate-imports': 'error',
      'no-return-await': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      'no-param-reassign': ['error'],
      'prefer-arrow-callback': 'error',
      'react/jsx-boolean-value': ['warn', 'never'],
      'react/self-closing-comp': 'warn',
      'react-hooks/exhaustive-deps': 'warn',

      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      'sort-imports': [
        'warn',
        {
          ignoreCase: false,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
          allowSeparatedGroups: true,
        },
      ],

      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],

          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@/**',
              group: 'internal',
            },
          ],

          pathGroupsExcludedImportTypes: ['react'],

          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },

          'newlines-between': 'always',
        },
      ],
    },
  },
]);
