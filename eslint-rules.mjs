export const ANGULAR_ESLINT_TS_RULES = {
  '@angular-eslint/use-component-view-encapsulation': 'error',
  '@angular-eslint/use-injectable-provided-in': 'error',
  '@angular-eslint/no-attribute-decorator': 'error',
  '@angular-eslint/require-lifecycle-on-prototype': 'error',
  '@angular-eslint/sort-lifecycle-methods': 'warn',
  '@angular-eslint/contextual-decorator': 'error',
  '@angular-eslint/no-conflicting-lifecycle': 'error',
  '@angular-eslint/no-duplicates-in-metadata-arrays': 'error',
  '@angular-eslint/no-inputs-metadata-property': 'error',
  '@angular-eslint/no-lifecycle-call': 'error',
  '@angular-eslint/no-output-native': 'error',
  '@angular-eslint/no-output-on-prefix': 'error',
  '@angular-eslint/no-outputs-metadata-property': 'error',
  '@angular-eslint/no-pipe-impure': 'warn',
  '@angular-eslint/no-queries-metadata-property': 'error',
  '@angular-eslint/prefer-output-readonly': 'error',
  '@angular-eslint/relative-url-prefix': 'error',
  '@angular-eslint/use-lifecycle-interface': 'error',
  '@angular-eslint/use-pipe-transform-interface': 'error',
  '@angular-eslint/prefer-signals': 'error'
};

export const ANGULAR_ESLINT_TEMPLATE_RULES = {
  '@angular-eslint/template/prefer-control-flow': 'error',
  '@angular-eslint/template/use-track-by-function': 'error',
  '@angular-eslint/template/prefer-static-string-properties': 'error',
  '@angular-eslint/template/no-duplicate-attributes': 'error',
  '@angular-eslint/template/conditional-complexity': 'warn',
  '@angular-eslint/template/cyclomatic-complexity': 'warn',
  '@angular-eslint/template/no-any': 'error',
  '@angular-eslint/template/no-interpolation-in-attributes': 'warn',
  '@angular-eslint/template/no-positive-tabindex': 'error',
  '@angular-eslint/template/attributes-order': 'warn',
  '@angular-eslint/template/alt-text': 'warn',
  '@angular-eslint/template/click-events-have-key-events': 'off',
  'unicorn/no-empty-file': 'off'
};

const DEFAULT_UNICORN_RULE_OVERRIDES = {
  'unicorn/prefer-string-raw': 'off',
  'unicorn/consistent-function-scoping': 'off',
  'unicorn/prevent-abbreviations': 'off',
  'unicorn/catch-error-name': 'warn',
  'unicorn/prefer-top-level-await': 'off',
  'unicorn/numeric-separators-style': 'warn',
  'unicorn/prefer-ternary': 'warn',
  'unicorn/no-null': 'off',
  'unicorn/prefer-set-has': 'warn',
  'unicorn/better-regex': 'warn',
  'unicorn/no-negated-condition': 'warn'
};

export const DEFAULT_SONARJS_HTML_RULE_OVERRIDES = {
  'sonarjs/no-unenclosed-multiline-block': 'off',
  'sonarjs/no-same-line-conditional': 'off',
  'sonarjs/no-element-overwrite': 'off'
};

const DEFAULT_SONARJS_RULE_OVERRIDES = {
  'sonarjs/todo-tag': 'warn',
  'sonarjs/deprecation': 'warn',
  'sonarjs/cognitive-complexity': 'warn',
  'sonarjs/no-commented-code': 'warn',
  'sonarjs/prefer-regexp-exec': 'warn'
};

export const DEFAULT_JS_RULE_OVERRIDES = {
  'arrow-body-style': 'off',
  complexity: 'off',
  'constructor-super': 'error',
  'default-case-last': 'error',
  'dot-notation': 'off',
  eqeqeq: ['error', 'smart'],
  'guard-for-in': 'error',
  'id-match': 'error',
  'max-classes-per-file': 'off',
  'max-lines-per-function': ['warn', { max: 200 }],
  'max-params': ['error', { max: 10 }],
  'no-bitwise': 'error',
  'no-caller': 'error',
  'no-cond-assign': 'error',
  'no-console': ['warn'],
  'no-debugger': 'error',
  'no-duplicate-case': 'error',
  'no-empty': 'error',
  'no-empty-pattern': 'error',
  'no-eval': 'error',
  'no-fallthrough': 'error',
  'no-invalid-this': 'error',
  'no-irregular-whitespace': 'off',
  'no-multi-str': 'error',
  'no-new-wrappers': 'error',
  'no-restricted-imports': ['error', 'rxjs/Rx'],
  'no-self-assign': 'error',
  'no-sequences': 'error',
  'no-shadow': 'error',
  'no-throw-literal': 'error',
  'no-undef-init': 'error',
  'no-underscore-dangle': 'off',
  'no-unsafe-finally': 'error',
  'no-unused-labels': 'error',
  'no-use-before-define': 'off',
  'no-var': 'error',
  'object-shorthand': 'off',
  ...DEFAULT_UNICORN_RULE_OVERRIDES,
  ...DEFAULT_SONARJS_RULE_OVERRIDES
};

export const DEFAULT_TS_RULE_OVERRIDES = {
  '@typescript-eslint/array-type': ['error', { default: 'array' }],
  '@typescript-eslint/await-thenable': 'error',
  '@typescript-eslint/consistent-type-assertions': 'off',
  '@typescript-eslint/consistent-type-definitions': 'error',
  '@typescript-eslint/dot-notation': 'warn',
  '@typescript-eslint/explicit-member-accessibility': ['off', { accessibility: 'explicit' }],
  '@typescript-eslint/member-ordering': 'off',
  '@typescript-eslint/naming-convention': [
    'error',
    {
      selector: 'variable',
      format: ['camelCase', 'UPPER_CASE']
    }
  ],
  '@typescript-eslint/no-for-in-array': 'error',
  '@typescript-eslint/no-inferrable-types': ['warn', { ignoreParameters: true }],
  '@typescript-eslint/no-unsafe-call': 'off',
  '@typescript-eslint/no-unsafe-return': 'off',
  '@typescript-eslint/no-unsafe-member-access': 'off',
  '@typescript-eslint/unbound-method': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-shadow': ['error', { hoist: 'all' }],
  '@typescript-eslint/no-unnecessary-type-assertion': 'error',
  '@typescript-eslint/no-use-before-define': 'off',
  '@typescript-eslint/no-var-requires': 'off',
  '@typescript-eslint/prefer-for-of': 'error',
  '@typescript-eslint/prefer-function-type': 'error',
  '@typescript-eslint/restrict-template-expressions': 'off',
  '@typescript-eslint/require-array-sort-compare': ['error', { ignoreStringArrays: true }],
  '@typescript-eslint/unified-signatures': 'error',
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/no-array-delete': 'error',
  '@typescript-eslint/no-base-to-string': 'error',
  '@typescript-eslint/no-duplicate-type-constituents': 'error',
  '@typescript-eslint/no-floating-promises': 'error',
  'no-implied-eval': 'off',
  '@typescript-eslint/no-implied-eval': 'error',
  '@typescript-eslint/no-misused-promises': 'error',
  '@typescript-eslint/no-redundant-type-constituents': 'error',
  '@typescript-eslint/no-unsafe-enum-comparison': 'error',
  '@typescript-eslint/no-unsafe-unary-minus': 'error',
  'no-throw-literal': 'off',
  '@typescript-eslint/only-throw-error': 'error',
  'prefer-promise-reject-errors': 'off',
  '@typescript-eslint/prefer-promise-reject-errors': 'error',
  'require-await': 'off',
  '@typescript-eslint/require-await': 'error',
  '@typescript-eslint/restrict-plus-operands': 'error'
};
