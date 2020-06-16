import {Option, isNone} from 'fp-ts/lib/Option'
import {version, compatibleMidnightVersions} from '../../package.json'

interface NetworkConstants {
  name: string
  shortTag: string
}

export const NETWORK_CONSTANTS: Record<NetworkTag, NetworkConstants> = {
  mainnet: {
    name: 'Mainnet',
    shortTag: 'main',
  },
  testnet: {
    name: 'Testnet',
    shortTag: 'test',
  },
}

export const TESTNET_EDITION = 'Testnet Edition'

export const LUNA_VERSION = `v${version}`

export const isTestnet = (networkTag: Option<NetworkTag>): boolean =>
  !isNone(networkTag) && networkTag.value === 'testnet'

export const DATADIR_VERSION = version
export const COMPATIBLE_VERSIONS = compatibleMidnightVersions
