import BigNumber from 'bignumber.js'
import {Token} from './tokens-state'
import {Formatters} from '../settings-state'
import {CallParams} from '../common/wallet-state'

export function getSendTokenParams(
  token: Token,
  senderAddress: string,
  recipientAddress: string,
  amount: BigNumber,
): CallParams {
  const data = `fake data ${recipientAddress} ${amount.toString(10)}` //FIXME ETCM-115

  return {
    from: ['Wallet', senderAddress],
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
