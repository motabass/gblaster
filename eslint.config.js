const { FlatCompat } = require('@eslint/eslintrc');
const nxEslintPlugin = require('@nx/eslint-plugin');
const js = require('@eslint/js');
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended
});
module.exports = [
  { plugins: { '@nx': nxEslintPlugin } },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*']
            },
            {
              sourceTag: 'ts',
              onlyDependOnLibsWithTags: ['ts']
            }
          ]
        }
      ]
    }
  },
  ...compat.config({ extends: ['plugin:@nx/typescript', 'plugin:unicorn/recommended'] }).map((config) => ({
    ...config,
    files: ['**/*.ts', '**/*.tsx'],
    rules: {}
  })),
  ...compat.config({ extends: ['plugin:@nx/javascript'] }).map((config) => ({
    ...config,
    files: ['**/*.js', '**/*.jsx'],
    rules: {}
  })),
  ...compat
    .config({
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2019,
        project: './tsconfig.base.json',
        sourceType: 'module'
      },
      extends: ['plugin:@nx/typescript', 'plugin:unicorn/recommended'],
      plugins: [
        'eslint-plugin-jsdoc',
        'eslint-plugin-prefer-arrow',
        'eslint-plugin-import',
        '@angular-eslint/eslint-plugin',
        '@typescript-eslint',
        'unused-imports'
      ]
    })
    .map((config) => ({
      ...config,
      files: ['**/*.ts'],
      rules: {
        'unicorn/prevent-abbreviations': 'off',
        'unicorn/numeric-separators-style': 'off',
        '@angular-eslint/component-class-suffix': 'error',
        '@angular-eslint/component-max-inline-declarations': 'error',
        '@angular-eslint/component-selector': [
          'error',
          {
            type: 'element',
            prefix: 'mtb',
            style: 'kebab-case'
          }
        ],
        '@angular-eslint/contextual-lifecycle': 'error',
        '@angular-eslint/directive-class-suffix': 'error',
        '@angular-eslint/directive-selector': [
          'error',
          {
            type: 'attribute',
            prefix: 'mtb',
            style: 'camelCase'
          }
        ],
        '@angular-eslint/no-attribute-decorator': 'error',
        '@angular-eslint/no-conflicting-lifecycle': 'error',
        '@angular-eslint/no-forward-ref': 'error',
        '@angular-eslint/no-host-metadata-property': 'error',
        '@angular-eslint/no-input-rename': 'error',
        '@angular-eslint/no-inputs-metadata-property': 'error',
        '@angular-eslint/no-lifecycle-call': 'error',
        '@angular-eslint/no-output-native': 'error',
        '@angular-eslint/no-output-on-prefix': 'error',
        '@angular-eslint/no-output-rename': 'error',
        '@angular-eslint/no-outputs-metadata-property': 'error',
        '@angular-eslint/no-pipe-impure': 'error',
        '@angular-eslint/no-queries-metadata-property': 'error',
        '@angular-eslint/prefer-output-readonly': 'error',
        '@angular-eslint/use-component-view-encapsulation': 'error',
        '@angular-eslint/use-lifecycle-interface': 'error',
        '@angular-eslint/use-pipe-transform-interface': 'error',
        '@typescript-eslint/ban-ts-comment': 'warn',
        '@typescript-eslint/naming-convention': [
          'warn',
          {
            selector: 'variable',
            modifiers: ['const'],
            format: ['camelCase', 'UPPER_CASE']
          }
        ],
        '@typescript-eslint/adjacent-overload-signatures': 'error',
        '@typescript-eslint/array-type': ['error', { default: 'array' }],
        '@typescript-eslint/ban-types': [
          'error',
          {
            types: {
              Object: { message: 'Avoid using the `Object` type. Did you mean `object`?' },
              Function: { message: 'Avoid using the `Function` type. Prefer a specific function type, like `() => void`.' },
              Boolean: { message: 'Avoid using the `Boolean` type. Did you mean `boolean`?' },
              Number: { message: 'Avoid using the `Number` type. Did you mean `number`?' },
              String: { message: 'Avoid using the `String` type. Did you mean `string`?' },
              Symbol: { message: 'Avoid using the `Symbol` type. Did you mean `symbol`?' }
            }
          }
        ],
        '@typescript-eslint/consistent-type-assertions': 'error',
        '@typescript-eslint/consistent-type-definitions': 'error',
        '@typescript-eslint/dot-notation': 'off',
        '@typescript-eslint/explicit-member-accessibility': ['off', { accessibility: 'explicit' }],
        '@typescript-eslint/indent': 'off',
        '@typescript-eslint/member-delimiter-style': [
          'off',
          {
            multiline: {
              delimiter: 'none',
              requireLast: true
            },
            singleline: {
              delimiter: 'semi',
              requireLast: false
            }
          }
        ],
        '@typescript-eslint/member-ordering': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-empty-interface': 'error',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-inferrable-types': ['error', { ignoreParameters: true }],
        '@typescript-eslint/no-misused-new': 'error',
        '@typescript-eslint/no-namespace': 'error',
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/no-parameter-properties': 'off',
        '@typescript-eslint/no-shadow': ['error', { hoist: 'all' }],
        '@typescript-eslint/no-unused-expressions': 'error',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-var-requires': 'error',
        '@typescript-eslint/prefer-for-of': 'error',
        '@typescript-eslint/prefer-function-type': 'error',
        '@typescript-eslint/prefer-namespace-keyword': 'error',
        '@typescript-eslint/quotes': 'off',
        '@typescript-eslint/semi': ['off', null],
        '@typescript-eslint/triple-slash-reference': [
          'error',
          {
            path: 'always',
            types: 'prefer-import',
            lib: 'always'
          }
        ],
        '@typescript-eslint/type-annotation-spacing': 'off',
        '@typescript-eslint/unified-signatures': 'error',
        'arrow-body-style': 'error',
        'arrow-parens': ['off', 'always'],
        'brace-style': ['off', 'off'],
        'comma-dangle': 'off',
        complexity: 'off',
        'constructor-super': 'error',
        'eol-last': 'off',
        eqeqeq: ['error', 'smart'],
        'guard-for-in': 'error',
        'id-blacklist': 'off',
        'id-match': 'off',
        'import/no-deprecated': 'warn',
        'jsdoc/check-alignment': 'error',
        'jsdoc/check-indentation': 'error',
        'linebreak-style': 'off',
        'max-classes-per-file': ['error', 1],
        'max-len': 'off',
        'new-parens': 'off',
        'newline-per-chained-call': 'off',
        'no-bitwise': 'error',
        'no-caller': 'error',
        'no-cond-assign': 'error',
        'no-console': [
          'warn',
          {
            allow: [
              'time',
              'timeEnd',
              'log',
              'warn',
              'dir',
              'timeLog',
              'assert',
              'clear',
              'count',
              'countReset',
              'group',
              'groupEnd',
              'table',
              'dirxml',
              'error',
              'groupCollapsed',
              'Console',
              'profile',
              'profileEnd',
              'timeStamp',
              'context'
            ]
          }
        ],
        'no-debugger': 'error',
        'no-empty': 'off',
        'no-eval': 'error',
        'no-extra-semi': 'off',
        'no-fallthrough': 'error',
        'no-invalid-this': 'off',
        'no-irregular-whitespace': 'off',
        'no-multiple-empty-lines': 'off',
        'no-new-wrappers': 'error',
        'no-restricted-imports': ['error', 'rxjs/Rx'],
        'no-throw-literal': 'error',
        'no-trailing-spaces': 'off',
        'no-undef-init': 'error',
        'no-underscore-dangle': 'off',
        'no-unsafe-finally': 'error',
        'no-unused-labels': 'error',
        'no-var': 'error',
        'object-shorthand': 'off',
        'one-var': ['error', 'never'],
        'prefer-arrow/prefer-arrow-functions': 'off',
        'prefer-const': 'error',
        'quote-props': 'off',
        radix: 'error',
        'space-before-function-paren': 'off',
        'space-in-parens': ['off', 'never'],
        'spaced-comment': ['error', 'always', { markers: ['/'] }],
        'use-isnan': 'error',
        'valid-typeof': 'off',
        'unused-imports/no-unused-imports': 'error'
      }
    })),
  ...compat.config({ extends: ['plugin:@nx/angular-template'] }).map((config) => ({
    ...config,
    files: ['**/*.html'],
    rules: {
      '@angular-eslint/template/banana-in-box': 'error',
      '@angular-eslint/template/no-inline-styles': 'warn',
      '@angular-eslint/template/conditional-complexity': ['error', { maxComplexity: 4 }],
      '@angular-eslint/template/cyclomatic-complexity': ['error', { maxComplexity: 5 }],
      '@angular-eslint/template/eqeqeq': 'error',
      '@angular-eslint/template/no-negated-async': 'error',
      '@angular-eslint/template/use-track-by-function': 'error'
    }
  }))
];
