module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['plugin:react/recommended', 'plugin:@typescript-eslint/recommended'],
  plugins: ['fp', 'prettier'],
  root: true,
  reportUnusedDisableDirectives: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
    project: './tsconfig.json',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      createClass: 'createReactClass',
      pragma: 'React',
      version: 'detect',
    },
  },
  rules: {
    'max-len': [
      'error',
      {
        comments: 100,
        code: 100,
        tabWidth: 2,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },
    ],
    'camelcase': ['error', {properties: 'never', ignoreDestructuring: true, ignoreImports: false}],
    'quotes': ['error', 'single', {avoidEscape: true, allowTemplateLiterals: true}],
    'no-constant-condition': ['error', {checkLoops: false}],
    'no-eval': 'error',
    'no-loop-func': 'error',
    'no-empty-function': 'error',
    'prefer-const': 'error',
    'space-infix-ops': 'error',
    'prefer-template': 'error',
    'no-useless-concat': 'error',
    'no-console': 0,
    'comma-dangle': 0,
    'guard-for-in': 0,
    'indent': 0,
    'curly': 0,
    // prettier
    'prettier/prettier': 'error',
    // ts
    '@typescript-eslint/member-delimiter-style': [
      'warn',
      {
        multiline: {
          delimiter: 'none',
          requireLast: false,
        },
        singleline: {
          delimiter: 'comma',
          requireLast: true,
        },
      },
    ],
    // fp
    'fp/no-arguments': 'error',
    'fp/no-class': 'error',
    'fp/no-delete': 'error',
    'fp/no-events': 'error',
    'fp/no-get-set': 'error',
    'fp/no-let': 'error',
    'fp/no-loops': 'error',
    'fp/no-mutating-assign': 'error',
    'fp/no-mutating-methods': 'error',
    'fp/no-mutation': 'error',
    'fp/no-proxy': 'error',
    'fp/no-this': 'error',
    'fp/no-throw': 'error',
    'fp/no-valueof-field': 'error',
    'fp/no-nil': 0,
    'fp/no-unused-expression': 0,
  },
}
