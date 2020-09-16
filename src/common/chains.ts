import {UnitType} from '../common/units'
import ethereumLogo from '../assets/icons/chains/ethereum.svg'

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
