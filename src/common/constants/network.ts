import {TKeyRenderer} from '../i18n'

interface NetworkConstants {
  name: TKeyRenderer
  shortTag: string
}

export const NETWORK_CONSTANTS: Record<NetworkTag, NetworkConstants> = {
  mainnet: {
    name: ['common', 'networkTag', 'mainnet'],
    shortTag: 'main',
  },
  testnet: {
    name: ['common', 'networkTag', 'testnet'],
    shortTag: 'test',
  },
}
