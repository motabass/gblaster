import nx from '@nx/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import sonarjs from 'eslint-plugin-sonarjs';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import {
  DEFAULT_JS_RULE_OVERRIDES,
  DEFAULT_SONARJS_HTML_RULE_OVERRIDES,
  DEFAULT_TS_RULE_OVERRIDES
} from './eslint-rules.mjs';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  sonarjs.configs.recommended,
  eslintPluginUnicorn.configs.recommended,
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
    rules: {
      ...DEFAULT_SONARJS_HTML_RULE_OVERRIDES
    }
  },
  eslintConfigPrettier
];
