import {packageLuna} from './lib/package'
import * as path from 'path'
import {promises as fs} from 'fs'

packageLuna({
  platform: 'win32',
  extraResource: undefined,
  afterCopy: [
    (buildPath, electronVersion, platform, arch, cb) => {
      const targetPlatformConfigPath = path.resolve(buildPath, 'platform-config.json5')
      console.log(`Writing Windows-specific configuration to ${targetPlatformConfigPath} ...`)
      const platformConfig = {runClients: false}

      return fs.writeFile(targetPlatformConfigPath, JSON.stringify(platformConfig)).then(() => cb())
    },
    (buildPath, electronVersion, platform, arch, cb) => {
      const currentReadmePath = path.resolve(__dirname, 'resources', 'README-WIN.txt')
      const targetPlatformReadmePath = path.resolve(buildPath, '..', '..', 'README.txt')
      console.log(`Writing Windows-specific README to ${targetPlatformReadmePath} ...`)

      return fs.copyFile(currentReadmePath, targetPlatformReadmePath).then(() => cb())
    },
  ],
})
