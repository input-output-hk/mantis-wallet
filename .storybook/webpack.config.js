const AntdScssThemePlugin = require('antd-scss-theme-plugin')
const webpack = require('webpack')
const path = require('path')

module.exports = ({config}) => {
  config.plugins.push(new AntdScssThemePlugin('./src/vars.scss'))
  config.plugins.push(
    new webpack.NormalModuleReplacementPlugin(
      /electron$/,
      path.resolve(__dirname, 'electron.mock.js'),
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

  return config
}
