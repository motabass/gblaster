const { FlatCompat } = require('@eslint/eslintrc');
const baseConfig = require('../../eslint.config.js');
const js = require('@eslint/js');
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended
});
module.exports = [
  ...baseConfig,
  ...compat.extends('plugin:cypress/recommended'),
  ...compat
    .config({
      extends: ['plugin:@nx/angular', 'plugin:@angular-eslint/template/process-inline-templates'],
      plugins: ['@angular-eslint/eslint-plugin', '@typescript-eslint']
    })
    .map((config) => ({
      ...config,
      files: ['apps/gblaster/**/*.ts'],
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
    })),
  ...compat.config({ extends: ['plugin:@nx/angular-template'] }).map((config) => ({
    ...config,
    files: ['apps/gblaster/**/*.html'],
    rules: {}
  })),
  {
    files: ['apps/gblaster/**/*.cy.{ts,js,tsx,jsx}', 'apps/gblaster/cypress/**/*.{ts,js,tsx,jsx}'],
    rules: {}
  }
];
