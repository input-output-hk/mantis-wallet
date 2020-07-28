import {UnitType} from '../common/units'
import ethereumLogo from '../assets/icons/chains/ethereum.svg'
import bitcoinLogo from '../assets/icons/chains/bitcoin.svg'
import midnightLogo from '../assets/icons/chains/dust.svg'

export interface Chain {
  symbol: string
  logo: string
  unitType: UnitType
}

export const ETC_CHAIN: Chain = {
  symbol: 'ETC',
  logo: ethereumLogo,
  unitType: 'Ether',
}

export const DST_CHAIN: Chain = {
  symbol: 'DST',
  logo: midnightLogo,
  unitType: 'Dust',
}

export const ETH_CHAIN: Chain = {
  symbol: 'ETH',
  logo: ethereumLogo,
  unitType: 'Ether',
}

export const BTC_CHAIN: Chain = {
  symbol: 'BTC',
  logo: bitcoinLogo,
  unitType: 'Bitcoin',
}
