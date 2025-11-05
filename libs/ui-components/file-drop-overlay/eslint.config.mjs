import nx from '@nx/eslint-plugin';
import baseConfig from '../../../eslint.config.mjs';
import { ANGULAR_ESLINT_TEMPLATE_RULES, ANGULAR_ESLINT_TS_RULES } from '../../../eslint-rules.mjs';

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
          prefix: 'mtb',
          style: 'camelCase'
        }
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'mtb',
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
  }
];
