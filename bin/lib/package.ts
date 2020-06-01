import * as path from 'path'
import * as electronPackager from 'electron-packager'
import packager from 'electron-packager'

export const packageLuna = (
  options: Partial<electronPackager.Options>,
): Promise<string | string[]> => {
  const appDir = path.resolve(__dirname, '..', '..')
  return packager({
    dir: appDir,
    arch: 'x64',
    electronZipDir: process.env['ELECTRON_ZIP_DIR'],
    extraResource:
      process.env['LUNA_DIST_PACKAGES_DIR'] || path.resolve(appDir, '..', 'midnight-dist'),
    // the icon's extension is normalized inside electron-packager per platform
    // for windows it will use icon.ico, for mac it will use icon.icns
    icon: path.resolve(appDir, 'public/icon.png'),
    // FIXME PM-1837 don't include package.json as it is in dist package
    ignore: /^\/(?!build|package.json).*/,
    out: path.resolve(appDir, 'dist'),
    overwrite: true,
    ...options,
  })
}
