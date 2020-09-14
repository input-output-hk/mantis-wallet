import {UnitType} from '../common/units'
import ethereumLogo from '../assets/icons/chains/ethereum.svg'
import bitcoinLogo from '../assets/icons/chains/bitcoin.svg'

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

export const BTC_CHAIN: Chain = {
  symbol: 'BTC',
  logo: bitcoinLogo,
  unitType: 'Bitcoin',
}
