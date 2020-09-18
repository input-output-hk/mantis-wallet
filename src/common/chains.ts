import ethereumLogo from '../assets/icons/chains/ethereum.svg'

export interface Chain {
  symbol: string
  logo: string
  decimals: number
}

export const ETC_CHAIN: Chain = {
  symbol: 'ETC',
  logo: ethereumLogo,
  decimals: 18,
}
