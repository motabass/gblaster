import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';
import cypress from 'eslint-plugin-cypress/flat';

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
      ]
    }
  },
  {
    files: ['**/*.html'],
    // Override or add rules here
    rules: {
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/banana-in-box': 'error',
      '@angular-eslint/template/no-inline-styles': 'warn',
      '@angular-eslint/template/conditional-complexity': ['error', { maxComplexity: 4 }],
      '@angular-eslint/template/cyclomatic-complexity': ['error', { maxComplexity: 5 }],
      '@angular-eslint/template/eqeqeq': 'error',
      '@angular-eslint/template/no-negated-async': 'error',
      '@angular-eslint/template/use-track-by-function': 'error',
      '@angular-eslint/template/prefer-static-string-properties': 'error'
    }
  },
  {
    files: ['**/*.cy.{ts,js,tsx,jsx}', 'cypress/**/*.{ts,js,tsx,jsx}'],
    ...cypress.configs['recommended'],
    // Override or add rules here
    rules: {}
  }
];
