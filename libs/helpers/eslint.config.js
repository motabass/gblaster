const baseConfig = require('../../eslint.config.js');
module.exports = [
  ...baseConfig,
  {
    files: ['libs/helpers/**/*.ts', 'libs/helpers/**/*.tsx', 'libs/helpers/**/*.js', 'libs/helpers/**/*.jsx'],
    rules: {}
  },
  {
    files: ['libs/helpers/**/*.ts', 'libs/helpers/**/*.tsx'],
    rules: {}
  },
  {
    files: ['libs/helpers/**/*.js', 'libs/helpers/**/*.jsx'],
    rules: {}
  }
];
