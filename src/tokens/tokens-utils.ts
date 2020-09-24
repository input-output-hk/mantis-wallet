import BigNumber from 'bignumber.js'
import {TransactionConfig} from 'web3-core'
import {Token} from './tokens-state'
import {Formatters} from '../settings-state'

export function getSendTokenParams(
  token: Token,
  senderAddress: string,
  recipientAddress: string,
  amount: BigNumber,
): TransactionConfig {
  const data = `fake data ${recipientAddress} ${amount.toString(10)}` //FIXME ETCM-115

  return {
    from: senderAddress,
    to: token.address,
    value: '0',
    data,
  }
}

export const formatTokenAmount = (
  abbreviateAmount: Formatters['abbreviateAmount'],
  token: Token,
  amount: BigNumber,
): string => `${abbreviateAmount(amount.shiftedBy(-token.decimals)).relaxed} ${token.symbol}`
