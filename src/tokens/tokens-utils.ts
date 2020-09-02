import Web3 from 'web3'
import BigNumber from 'bignumber.js'
import erc20abi from '../assets/contracts/ERC20.json'
import {CallParams} from '../web3'
import {Token} from './tokens-state'
import {Formatters} from '../settings-state'
import {bech32toHex, toHex} from '../common/util'

const web3sync = new Web3()
export const ERC20Contract = web3sync.eth.contract(erc20abi).at()

export function getSendTokenParams(
  token: Token,
  senderAddress: string,
  recipientAddress: string,
  amount: BigNumber,
): CallParams {
  const data = ERC20Contract.transfer.getData(
    bech32toHex(recipientAddress),
    toHex(amount.shiftedBy(token.decimals)),
  )

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
