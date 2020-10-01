import {Option, isNone, Some} from 'fp-ts/lib/Option'
import {version, compatibleDataDirVersions} from '../../package.json'

export const LUNA_VERSION = `v${version}`

export const isTestnet = (networkType: Option<string>): networkType is Some<string> =>
  !isNone(networkType) && networkType.value !== 'main'

export const DATADIR_VERSION = version
export const COMPATIBLE_VERSIONS = compatibleDataDirVersions
