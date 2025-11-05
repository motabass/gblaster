import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';
import cypress from 'eslint-plugin-cypress/flat';
import { ANGULAR_ESLINT_TEMPLATE_RULES, ANGULAR_ESLINT_TS_RULES } from '../../eslint-rules.mjs';

export default [
  ...baseConfig,
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: '',
          style: 'camelCase'
        }
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: '',
          style: 'kebab-case'
        }
      ],
      ...ANGULAR_ESLINT_TS_RULES
    }
  },
  {
    files: ['**/*.html'],
    // Override or add rules here
    rules: {
      ...ANGULAR_ESLINT_TEMPLATE_RULES
    }
  },
  {
    files: ['**/*.cy.{ts,js,tsx,jsx}', 'cypress/**/*.{ts,js,tsx,jsx}'],
    ...cypress.configs['recommended'],
    // Override or add rules here
    rules: {}
  }
];
