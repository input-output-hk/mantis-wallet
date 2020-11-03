module.exports = {
  arrowParens: 'always',
  bracketSpacing: false,
  endOfLine: 'lf',
  parser: 'typescript',
  printWidth: 100,
  quoteProps: 'consistent',
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  overrides: [
    {
      files: '*.scss',
      options: {parser: 'scss'},
    },
  ],
}
