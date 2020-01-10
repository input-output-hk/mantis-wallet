const {override, fixBabelImports, addWebpackPlugin} = require('customize-cra')
const AntdScssThemePlugin = require('antd-scss-theme-plugin')

const addLessLoader = () => (config) => {
  const loaders = config.module.rules.find((rule) => Array.isArray(rule.oneOf)).oneOf

  loaders.splice(loaders.length - 1, 0, {
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
  })

  return config
}

module.exports = override(
  addWebpackPlugin(new AntdScssThemePlugin('./src/theme.scss')),
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true,
  }),
  addLessLoader(),
)
