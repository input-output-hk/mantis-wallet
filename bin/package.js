const packager = require('electron-packager')
const path = require('path')

packager({
  dir: path.resolve(__dirname, '..'),
  arch: 'x64',
  platform: ['darwin', 'linux'],
  // platform: 'win32',
  extraResource: path.resolve(__dirname, '..', '..', 'midnight-dist'),
  ignore: [/\.idea/, /\.storybook/, /\.circleci/, /public\//, /src\//, /bin\//],
  out: path.resolve(__dirname, '..', 'dist'),
  overwrite: true,
})
