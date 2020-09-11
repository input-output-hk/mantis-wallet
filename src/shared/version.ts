import {Option, isNone} from 'fp-ts/lib/Option'
import {version, compatibleNodeVersions} from '../../package.json'

export const LUNA_VERSION = `v${version}`

export const isTestnet = (networkTag: Option<NetworkTag>): boolean =>
  !isNone(networkTag) && networkTag.value === 'testnet'

export const DATADIR_VERSION = version
export const COMPATIBLE_VERSIONS = compatibleNodeVersions
