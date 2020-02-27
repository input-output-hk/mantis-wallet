const {override, fixBabelImports, addWebpackPlugin, useBabelRc} = require('customize-cra')
const AntdScssThemePlugin = require('antd-scss-theme-plugin')
const WorkerPlugin = require('worker-plugin')

//
// This method returns the loaders from create-react-app's webpack config
//
// Refer to for correct structure of the config object:
// https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/config/webpack.config.js
const getLoaders = (config) => config.module.rules.find((rule) => Array.isArray(rule.oneOf)).oneOf

const addLessLoader = () => (config) => {
  const loaders = getLoaders(config)

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

const addRawImages = () => (config) => {
  const loaders = getLoaders(config)

  loaders.splice(0, 0, {
    test: /\.svg$/i,
    use: ['raw-loader'],
  })

  loaders.splice(0, 0, {
    test: /\.(png|jpe?g|gif)$/i,
    use: ['url-loader'],
  })

  return config
}

module.exports = override(
  addWebpackPlugin(new AntdScssThemePlugin('./src/vars.scss')),
  addWebpackPlugin(new WorkerPlugin()),
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true,
  }),
  addLessLoader(),
  addRawImages(),
  useBabelRc(),
  (config) => ({...config, target: 'electron-renderer'}),
)
