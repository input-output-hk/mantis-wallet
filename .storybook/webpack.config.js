const AntdScssThemePlugin = require('antd-scss-theme-plugin')

module.exports = ({config}) => {
  config.plugins.push(new AntdScssThemePlugin('./src/theme.scss'))

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
