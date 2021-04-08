const MAX_LEN = {
  code: 100,
  ignoreUrls: true,
  ignoreRegExpLiterals: true,
};

module.exports = {
  root: true,

  env: {
    es6: true,
    node: true,
  },

  extends: [
    'google',
    'eslint:recommended',
    'plugin:vue/recommended',
  ],

  rules: {
    // Possible errors:
    'no-cond-assign': 'error',

    // Best practices:
    'accessor-pairs': 'error',
    'complexity': [2, 16],
    'curly': ['error', 'all'],
    'default-case': 'error',
    'dot-notation': 'error',
    'eqeqeq': 'error',
    'no-alert': 'error',
    'no-div-regex': 'error',
    'no-else-return': 'error',
    'no-eq-null': 'error',
    'no-eval': 'error',
    'no-floating-decimal': 'error',
    'no-implied-eval': 'error',
    'no-iterator': 'error',
    'no-labels': 'error',
    'no-lone-blocks': 'error',
    'no-new-func': 'error',
    'no-new': 'error',
    'no-octal-escape': 'error',
    'no-proto': 'error',
    'no-return-assign': 'error',
    'no-script-url': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-useless-call': 'error',
    'no-useless-concat': 'error',
    'no-void': 'error',
    'radix': 'error',
    'wrap-iife': 'error',
    'yoda': ['error', 'never'],

    // Variables:
    'no-label-var': 'error',
    'no-undef-init': 'error',

    // Stylistic issues:
    'comma-dangle': ['error', 'always-multiline'],
    'consistent-this': ['error', 'me'],
    'linebreak-style': 'off',
    'max-len': ['error', MAX_LEN],
    'max-statements': ['error', 32],
    'new-parens': 'error',
    'no-whitespace-before-property': 'error',
    'one-var-declaration-per-line': 'error',
    'space-in-parens': ['error', 'never'],
    'space-unary-ops': ['error', {
      nonwords: false,
      words: true,
    }],

    // ECMAScript 6:
    'no-confusing-arrow': 'error',
    'no-duplicate-imports': 'error',
    'prefer-arrow-callback': 'error',

    // Vue:
    'vue/max-len': ['error', MAX_LEN],

    // Deprecated:
    'require-jsdoc': 'off',
    'valid-jsdoc': 'off',
  },
};
