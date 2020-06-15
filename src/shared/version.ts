import {Option, isNone} from 'fp-ts/lib/Option'
import {version} from '../../package.json'

interface NetworkConstants {
  name: string
}

export const NETWORK_CONSTANTS: Record<NetworkTag, NetworkConstants> = {
  mainnet: {
    name: 'Mainnet',
  },
  testnet: {
    name: 'Testnet',
  },
}

export const TESTNET_EDITION = 'Testnet Edition'

export const LUNA_VERSION = `v${version}`

export const isTestnet = (networkTag: Option<NetworkTag>): boolean =>
  !isNone(networkTag) && networkTag.value === 'testnet'
