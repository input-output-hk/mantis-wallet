module.exports = {
  extends: [
    'plugin:prettier/recommended',
    'plugin:react/recommended',
    'prettier',
    'prettier/react',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  plugins: ['fp', 'prettier'],
  root: true,
  reportUnusedDisableDirectives: true,
  env: {
    browser: true,
    node: true,
  },
  settings: {
    react: {
      createClass: 'createReactClass',
      pragma: 'React',
      version: 'detect',
    },
  },
  rules: {
    'quotes': ['error', 'single', {avoidEscape: true, allowTemplateLiterals: true}],
    'no-constant-condition': ['error', {checkLoops: false}],
    'no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
    'no-eval': 'error',
    'no-loop-func': 'error',
    'no-empty-function': ['error', {allow: ['constructors']}],
    'prefer-const': 'error',
    'space-infix-ops': 'error',
    'prefer-template': 'error',
    'no-useless-concat': 'error',
    'camelcase': 0,
    'no-use-before-define': 0,
    'max-len': 0,
    'no-console': 0,
    'comma-dangle': 0,
    'guard-for-in': 0,
    'indent': 0,
    'curly': 0,
    // prettier
    'prettier/prettier': 'error',
    // import
    'import/order': [
      'error',
      {
        'newlines-between': 'never',
        'groups': ['builtin', 'external', ['parent', 'sibling'], 'index'],
      },
    ],
    'import/no-named-as-default': 0,
    // fp
    'fp/no-arguments': 'error',
    'fp/no-delete': 'error',
    'fp/no-events': 'error',
    'fp/no-get-set': 'error',
    'fp/no-let': 'error',
    'fp/no-loops': 'error',
    'fp/no-mutating-assign': 'error',
    'fp/no-mutating-methods': 'error',
    'fp/no-mutation': 'error',
    'fp/no-proxy': 'error',
    'fp/no-valueof-field': 'error',
    'fp/no-throw': 0,
    'fp/no-rest-parameters': 0,
    'fp/no-this': 0,
    'fp/no-class': 0,
    'fp/no-nil': 0,
    'fp/no-unused-expression': 0,
  },
  overrides: [
    {
      //TS-only
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2019,
        sourceType: 'module',
        project: './tsconfig.json',
        ecmaFeatures: {
          jsx: true,
        },
      },
      files: ['**/*.ts?(x)'],
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended', 'prettier/@typescript-eslint'],
      rules: {
        // TS
        '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
        '@typescript-eslint/array-type': ['error', {default: 'array-simple'}],
        '@typescript-eslint/no-use-before-define': ['error', {functions: false}],
        '@typescript-eslint/camelcase': [
          'error',
          {properties: 'never', ignoreDestructuring: true, ignoreImports: false},
        ],
        '@typescript-eslint/explicit-function-return-type': [
          'error',
          {
            allowExpressions: true,
            allowTypedFunctionExpressions: true,
            allowHigherOrderFunctions: true,
          },
        ],
      },
    },
  ],
}
