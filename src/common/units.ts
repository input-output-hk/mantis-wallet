import _ from 'lodash'
import BigNumber from 'bignumber.js'
import {fromWei, toWei} from 'web3/lib/utils/utils.js'

const BITCOIN_TO_SATOSHI = new BigNumber('1e8')

function toSatoshi(number: string): string
function toSatoshi(number: BigNumber): BigNumber
function toSatoshi(number: string | BigNumber): string | BigNumber {
  const satoshiValue = new BigNumber(number).multipliedBy(BITCOIN_TO_SATOSHI)
  return _.isString(number) ? satoshiValue.toString(10) : satoshiValue
}

function fromSatoshi(number: string): string
function fromSatoshi(number: BigNumber): BigNumber
function fromSatoshi(number: string | BigNumber): string | BigNumber {
  const bitcoinValue = new BigNumber(number).dividedBy(BITCOIN_TO_SATOSHI)
  return _.isString(number) ? bitcoinValue.toString(10) : bitcoinValue
}

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

export const UNITS: Record<UnitType, Unit> = {
  Dust: {
    fromBasic: fromWei,
    toBasic: toWei,
  },
  Ether: {
    fromBasic: fromWei,
    toBasic: toWei,
  },
  Bitcoin: {
    fromBasic: fromSatoshi,
    toBasic: toSatoshi,
  },
} as const
