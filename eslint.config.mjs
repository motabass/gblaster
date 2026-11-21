import nx from '@nx/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import sonarjs from 'eslint-plugin-sonarjs';
import packageJson from 'eslint-package-json';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import angularTemplate from '@html-eslint/eslint-plugin-angular-template';
import templateParser from '@angular-eslint/template-parser';
import { DEFAULT_HTML_RULE_OVERRIDES, DEFAULT_JS_RULE_OVERRIDES, DEFAULT_TS_RULE_OVERRIDES } from './eslint-rules.mjs';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  { ...sonarjs.configs.recommended, files: ['**/*.{js,mjs,cjs,jsx,ts,tsx,html}'] },
  { ...eslintPluginUnicorn.configs.recommended, files: ['**/*.{js,mjs,cjs,jsx,ts,tsx,html}'] },
  {
    ignores: ['**/dist', 'coverage', '.angular', '.nx', '**/vitest.config.*.timestamp*']
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            {
              sourceTag: 'ts',
              onlyDependOnLibsWithTags: ['ts', 'domain'],
              bannedExternalImports: ['*angular*']
            },
            {
              sourceTag: 'domain',
              onlyDependOnLibsWithTags: ['domain']
            },
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*']
            }
          ],
          enforceBuildableLibDependency: false,
          banTransitiveDependencies: true,
          checkNestedExternalImports: true
        }
      ],
      ...DEFAULT_JS_RULE_OVERRIDES
    }
  },
  {
    files: ['**/*.js', '**/*.mjs', '**/*.jsx'],
    rules: {
      ...DEFAULT_JS_RULE_OVERRIDES
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      parserOptions: { project: ['./tsconfig.*?.json'] }
    },
    rules: {
      ...DEFAULT_TS_RULE_OVERRIDES
    }
  },
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: templateParser
    },
    plugins: {
      '@html-eslint/angular-template': angularTemplate
    },
    rules: {
      ...angularTemplate.configs.recommended.rules,
      ...DEFAULT_HTML_RULE_OVERRIDES
    }
  },
  packageJson.configs.recommended,
  {
    files: ['**/package.json'],
    rules: {
      'package-json/dependency-version-range': [
        'error',
        {
          range: 'consistent'
        }
      ]
    }
  },
  eslintConfigPrettier
];
