import _ from 'lodash'
import BigNumber from 'bignumber.js'
import {fromWei, toWei} from 'web3/lib/utils/utils.js'

export type UnitType = 'Dust' | 'Ether' | 'Bitcoin'

interface Unit {
  fromBasic: {
    (number: string): string
    (number: BigNumber): BigNumber
  }
  toBasic: {
    (number: string): string
    (number: BigNumber): BigNumber
  }
}

const DUST_TO_ATOM = new BigNumber('1e8')
const BITCOIN_TO_SATOSHI = new BigNumber('1e8')

const createConverters = (unitToBasic: BigNumber): Unit => {
  function toBasic(number: string): string
  function toBasic(number: BigNumber): BigNumber
  function toBasic(number: string | BigNumber): string | BigNumber {
    const basicValue = new BigNumber(number).multipliedBy(unitToBasic)
    return _.isString(number) ? basicValue.toString(10) : basicValue
  }

  function fromBasic(number: string): string
  function fromBasic(number: BigNumber): BigNumber
  function fromBasic(number: string | BigNumber): string | BigNumber {
    const unitValue = new BigNumber(number).dividedBy(unitToBasic)
    return _.isString(number) ? unitValue.toString(10) : unitValue
  }

  return {
    toBasic,
    fromBasic,
  }
}

export const UNITS: Record<UnitType, Unit> = {
  Dust: createConverters(DUST_TO_ATOM),
  Ether: {
    fromBasic: fromWei,
    toBasic: toWei,
  },
  Bitcoin: createConverters(BITCOIN_TO_SATOSHI),
} as const
