import {packageLuna} from './lib/package'
import * as path from 'path'
import {promisify} from 'util'
import * as fs from 'fs'

packageLuna({
  platform: 'win32',
  extraResource: undefined,
  afterCopy: [
    (buildPath, electronVersion, platform, arch, cb) => {
      const targetPlatformConfigPath = path.resolve(buildPath, 'platform-config.json5')
      console.log(`Writing Windows-specific configuration to ${targetPlatformConfigPath} ...`)
      const platformConfig = {runClients: false}

      return promisify(fs.writeFile)(
        targetPlatformConfigPath,
        JSON.stringify(platformConfig),
      ).then(() => cb())
    },
  ],
})
