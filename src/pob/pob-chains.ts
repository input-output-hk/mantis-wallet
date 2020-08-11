import {Chain, ETH_CHAIN, BTC_CHAIN} from '../common/chains'
import {TKeyRenderer} from '../common/i18n'
import bitcoinBurnLogo from '../assets/icons/chains/m-btc.svg'
import ethereumBurnLogo from '../assets/icons/chains/m-eth.svg'

export const ALL_POB_CHAIN_IDS = [
  'BTC_MAINNET',
  'BTC_TESTNET',
  'ETH_MAINNET',
  'ETH_TESTNET',
] as const
export type PobChainId = typeof ALL_POB_CHAIN_IDS[number]

export interface PobChain extends Chain {
  id: PobChainId
  numericId: number
  burnLogo: string
  translations: {
    burn: TKeyRenderer
    burnFor: TKeyRenderer
    burnDescription: TKeyRenderer
    burnAddress: TKeyRenderer
    generateAddress: TKeyRenderer
    proverRewardLabel: TKeyRenderer
  }
}

export const POB_CHAINS: Record<PobChainId, PobChain> = {
  BTC_MAINNET: {
    id: 'BTC_MAINNET',
    numericId: 0,
    burnLogo: bitcoinBurnLogo,
    translations: {
      burn: ['proofOfBurn', 'title', 'burnBitcoin'],
      burnFor: ['proofOfBurn', 'button', 'burnBitcoinForMBtc'],
      burnDescription: ['proofOfBurn', 'message', 'burnProcessDescriptionForBitcoin'],
      burnAddress: ['proofOfBurn', 'title', 'bitcoinBurnAddress'],
      generateAddress: ['proofOfBurn', 'button', 'generateBtcAddress'],
      proverRewardLabel: ['proofOfBurn', 'label', 'proverRewardInMBtc'],
    },
    ...BTC_CHAIN,
  },
  BTC_TESTNET: {
    id: 'BTC_TESTNET',
    numericId: 1,
    burnLogo: bitcoinBurnLogo,
    translations: {
      burn: ['proofOfBurn', 'title', 'burnBitcoin'],
      burnFor: ['proofOfBurn', 'button', 'burnBitcoinForMBtc'],
      burnDescription: ['proofOfBurn', 'message', 'burnProcessDescriptionForBitcoin'],
      burnAddress: ['proofOfBurn', 'title', 'bitcoinBurnAddress'],
      generateAddress: ['proofOfBurn', 'button', 'generateBtcAddress'],
      proverRewardLabel: ['proofOfBurn', 'label', 'proverRewardInMBtc'],
    },
    ...BTC_CHAIN,
  },
  ETH_MAINNET: {
    id: 'ETH_MAINNET',
    numericId: 2,
    burnLogo: ethereumBurnLogo,
    translations: {
      burn: ['proofOfBurn', 'title', 'burnEthereum'],
      burnFor: ['proofOfBurn', 'button', 'burnEthereumForMEth'],
      burnDescription: ['proofOfBurn', 'message', 'burnProcessDescriptionForEthereum'],
      burnAddress: ['proofOfBurn', 'title', 'ethereumBurnAddress'],
      generateAddress: ['proofOfBurn', 'button', 'generateEthAddress'],
      proverRewardLabel: ['proofOfBurn', 'label', 'proverRewardInMEth'],
    },
    ...ETH_CHAIN,
  },
  ETH_TESTNET: {
    id: 'ETH_TESTNET',
    numericId: 3,
    burnLogo: ethereumBurnLogo,
    translations: {
      burn: ['proofOfBurn', 'title', 'burnEthereum'],
      burnFor: ['proofOfBurn', 'button', 'burnEthereumForMEth'],
      burnDescription: ['proofOfBurn', 'message', 'burnProcessDescriptionForEthereum'],
      burnAddress: ['proofOfBurn', 'title', 'ethereumBurnAddress'],
      generateAddress: ['proofOfBurn', 'button', 'generateEthAddress'],
      proverRewardLabel: ['proofOfBurn', 'label', 'proverRewardInMEth'],
    },
    ...ETH_CHAIN,
  },
}
