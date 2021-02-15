const path = require('path')
const webpack = require('webpack')
const mainOverride = require('../config-overrides.js')

module.exports = {
  overrideConfig: (config) => {
    config = mainOverride(config)

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

    // output.globalObject is set to "window". It must be set to "self" to support HMR in Workers
    config.output.globalObject = 'self'

    return config
  },
}
