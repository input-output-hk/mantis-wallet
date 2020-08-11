import {Chain, ETC_CHAIN as PURE_ETC_CHAIN} from '../common/chains'
import {TKeyRenderer} from '../common/i18n'

export interface GdChain extends Chain {
  translations: {
    address: TKeyRenderer
    publicAddressLabel: TKeyRenderer
    privateKeyLabel: TKeyRenderer
    privateKeyLabelLong: TKeyRenderer
    balanceLabel: TKeyRenderer
    lowBalanceError: TKeyRenderer
    confirmBalance: TKeyRenderer
  }
}

export const ETC_CHAIN: GdChain = {
  translations: {
    address: ['glacierDrop', 'label', 'etcAddress'],
    publicAddressLabel: ['glacierDrop', 'label', 'etcPublicAddress'],
    privateKeyLabel: ['glacierDrop', 'label', 'etcPrivateKey'],
    privateKeyLabelLong: ['glacierDrop', 'label', 'etcPrivateKeyFromYourWallet'],
    balanceLabel: ['glacierDrop', 'label', 'etcBalance'],
    lowBalanceError: ['glacierDrop', 'error', 'lowEtcBalanceError'],
    confirmBalance: ['glacierDrop', 'message', 'confirmEtcBalance'],
  },
  ...PURE_ETC_CHAIN,
}
