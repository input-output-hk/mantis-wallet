import {DefinedNetworkName} from './config/type'

export const LINKS = {
  support: 'https://iohk.zendesk.com/hc/en-us/requests/new',
}

type ExplorerLinks = Record<DefinedNetworkName, (hash: string) => string>

export const EXPLORER_LINKS_FOR_TX: ExplorerLinks = {
  'etc': (txHash) => `https://blockexplorer.one/etc/mainnet/tx/${txHash}`,
  'mordor': (txHash) => `https://blockexplorer.one/etc/mordor/tx/${txHash}`,
  'testnet-internal-nomad': (txHash) =>
    `https://mantis-testnet-explorer.mantis.ws/transaction/${txHash}`,
}
