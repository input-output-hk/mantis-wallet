import * as path from 'path'
import {promises as fs} from 'fs'
import * as electronPackager from 'electron-packager'
import packager from 'electron-packager'

export const packageMantisWallet = (
  options: Partial<electronPackager.Options>,
): Promise<string | string[]> => {
  const appDir = path.resolve(__dirname, '..', '..')
  return packager({
    dir: appDir,
    arch: 'x64',
    electronZipDir: process.env['ELECTRON_ZIP_DIR'],
    extraResource: process.env['MANTIS_DIST_DIR'] || path.resolve(appDir, '..', 'mantis-dist'),
    // The icon's extension is normalized inside electron-packager per platform
    // for windows it will use icon.ico, for mac it will use icon.icns,
    // but only if you leave out the file extension.
    // For Linux: you should use BrowserWindow({icon}) to set it. It should be a png.
    icon: path.resolve(appDir, 'public/icon'),
    ignore: /^\/(?!build).*/,
    out: path.resolve(appDir, 'dist'),
    afterCopy: [
      (buildPath, _electronVersion, _platform, _arch, callback) =>
        fs
          .rename(
            path.resolve(buildPath, 'build/main', 'package.json'),
            path.resolve(buildPath, 'package.json'),
          )
          .then(callback),
    ],
    overwrite: true,
    ...options,
  })
}
