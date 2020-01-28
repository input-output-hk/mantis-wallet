const packager = require('electron-packager')
const path = require('path')
const fs = require('fs')
const {promisify} = require('util')

console.log(
  `Preparing Windows package. You can find it in ${path.resolve(
    __dirname,
    '..',
    'dist',
  )} when done`,
)

packager({
  dir: path.resolve(__dirname, '..'),
  arch: 'x64',
  platform: 'win32',
  ignore: [/\.idea/, /\.storybook/, /\.circleci/, /public\//, /src\//, /bin\//],
  out: path.resolve(__dirname, '..', 'dist'),
  overwrite: true,
  afterCopy: [
    (buildPath, electronVersion, platform, arch, callbackFn) => {
      console.log(buildPath)
      return promisify(fs.readdir)(buildPath)
        .then((paths) => console.log(paths))
        .then(() => callbackFn())
    },
    (buildPath, electronVersion, platform, arch, cb) => {
      const targetPlatformConfigPath = path.resolve(buildPath, 'platform-config.json5')
      console.log(`Writing Windows-specific configuration to ${targetPlatformConfigPath} ...`)
      const platformConfig = {runClients: false}
      return promisify(fs.writeFile)(targetPlatformConfigPath, JSON.stringify(platformConfig))
        .then(() => cb())
    },
  ],
})
