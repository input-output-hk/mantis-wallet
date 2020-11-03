const path = require('path')
const webpack = require('webpack')
const AntdScssThemePlugin = require('antd-scss-theme-plugin')
const WorkerPlugin = require('worker-plugin')

const disableEslint = (e) => {
  return (
    e.module.rules
      .filter((e) => e.use && e.use.some((e) => e.options && void 0 !== e.options.useEslintrc))
      .forEach((s) => {
        e.module.rules = e.module.rules.filter((e) => e !== s)
      }),
    e
  )
}

module.exports = ({config}) => {
  config = disableEslint(config)

  config.plugins.push(new AntdScssThemePlugin('./src/vars.scss'))
  config.plugins.push(new WorkerPlugin())
  config.plugins.push(
    new webpack.NormalModuleReplacementPlugin(
      /electron$/,
      path.resolve(__dirname, './mocks/electron.mock.js'),
    ),
  )
  config.plugins.push(
    new webpack.NormalModuleReplacementPlugin(
      /electron-store$/,
      path.resolve(__dirname, './mocks/electron-store.mock.js'),
    ),
  )
  config.plugins.push(
    new webpack.NormalModuleReplacementPlugin(
      /electron-log$/,
      path.resolve(__dirname, './mocks/electron-log.mock.js'),
    ),
  )

  config.module.rules.push(
    {
      test: /\.(ts|tsx)$/,
      use: [
        {
          loader: require.resolve('awesome-typescript-loader'),
        },
        // Optional
        {
          loader: require.resolve('react-docgen-typescript-loader'),
        },
      ],
    },
    {
      test: /\.less$/,
      use: [
        {
          loader: 'style-loader',
        },
        {
          loader: 'css-loader',
        },
        AntdScssThemePlugin.themify({
          loader: 'less-loader',
          options: {
            javascriptEnabled: true,
          },
        }),
      ],
    },
  )
  config.resolve.extensions.push('.ts', '.tsx', '.less')

  // output.globalObject is set to "window". It must be set to "self" to support HMR in Workers
  config.output.globalObject = 'this'

  return config
}
