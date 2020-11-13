import {DefinedNetworkName} from './config/type'

export const LINKS = {
  support: 'https://ethereumclassic.org/',
  feedback: 'https://ethereumclassic.org/',
}

type ExplorerLinks = Record<DefinedNetworkName, (hash: string) => string>

export const EXPLORER_LINKS_FOR_TX: ExplorerLinks = {
  'etc': (txHash) => `https://blockexplorer.one/etc/mainnet/tx/${txHash}`,
  'mordor': (txHash) => `https://blockexplorer.one/etc/mordor/tx/${txHash}`,
  'testnet-internal': (txHash) => `https://testnet-explorer.mantis.ws/transaction/${txHash}`,
}
