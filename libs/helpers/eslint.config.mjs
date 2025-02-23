import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts'],
    rules: {}
  },
  {
    files: ['**/*.html'],
    // Override or add rules here
    rules: {}
  }
];
