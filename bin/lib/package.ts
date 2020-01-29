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
    extraResource: path.resolve(appDir, '..', 'midnight-dist'),
    ignore: [
      /\.idea/,
      /\.storybook/,
      /\.circleci/,
      /public\//,
      /src\//,
      /bin\//,
      /platform-config\.json5/,
    ],
    out: path.resolve(appDir, 'dist'),
    overwrite: true,
    ...options,
  })
}
