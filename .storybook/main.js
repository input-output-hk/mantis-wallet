const {overrideConfig} = require('./customWebpack.js')

module.exports = {
  stories: ['../src/**/*.stories.tsx'],
  addons: [
    '@storybook/preset-create-react-app',
    '@storybook/addon-knobs/register',
    '@storybook/addon-actions/register',
    '@storybook/addon-links/register',
  ],
  webpackFinal: (config) => {
    const newConfig = overrideConfig(config)
    return {...config, module: newConfig.module}
  },
}
