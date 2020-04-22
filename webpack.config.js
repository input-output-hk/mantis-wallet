const path = require('path')

const mainConfig = {
  devtool: false,
  mode: 'production',
  entry: './src/main/main.ts',
  target: 'electron-main',
  output: {path: path.join(__dirname, 'build/main'), filename: 'main.js'},
  node: {__dirname: false, __filename: false},
  resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          configFile: path.join(__dirname, 'tsconfig.main.json'),
        },
      },
    ],
  },
}

module.exports = [mainConfig]
