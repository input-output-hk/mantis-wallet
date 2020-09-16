import _ from 'lodash'
import BigNumber from 'bignumber.js'

export type UnitType = 'Ether'

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

const createConverters = (): Unit => {
  const unitToBasic = 1e18

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
  Ether: createConverters(), // FIXME ETCM-113 use web3
} as const
