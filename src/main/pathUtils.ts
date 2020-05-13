import * as os from 'os'

export const tildeToHome = (path: string): string =>
  path.startsWith('~') ? path.replace('~', os.homedir()) : path
