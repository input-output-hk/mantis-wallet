/* eslint-disable @typescript-eslint/ban-ts-comment */
import _ from 'lodash'
import Web3 from 'web3'
import {formatters} from 'web3-core-helpers'
import BigNumber from 'bignumber.js'
import {Transaction} from 'web3-core'
import {fromUnixTime} from 'date-fns'
import * as T from 'io-ts'
import {option} from 'fp-ts'
import {pipe} from 'fp-ts/lib/pipeable'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const accountTransactionFormatter = (input: any): any => {
  const intermediate = formatters.outputTransactionFormatter(input)
  return {
    ...intermediate,
    timestamp: pipe(
      intermediate.timestamp,
      option.fromNullable,
      option.map((ts) => (_.isString(ts) ? fromUnixTime(parseInt(ts, 16)) : fromUnixTime(ts))),
      option.getOrElseW(() => null),
    ),
    gasUsed: intermediate.gasUsed && formatters.outputBigNumberFormatter(intermediate.gasUsed),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const accountTransactionsFormatter = (output: any): any => {
  if (_.isArray(output?.transactions)) {
    return output.transactions.map(accountTransactionFormatter)
  }

  return []
}

//https://eth.wiki/json-rpc/json-rpc-error-codes-improvement-proposal
export const CustomError = T.type({
  code: T.number,
  message: T.string,
})
export const CustomErrors = T.readonlyArray(CustomError)

export interface AccountTransaction extends Transaction {
  isOutgoing: boolean
  isPending: boolean
  timestamp: Date | null
  gasUsed: number | null
}
export type MantisWeb3 = Web3 & {
  mantis: {
    getAccountTransactions: (
      address: string,
      fromBlock: BigNumber | number,
      toBlock: BigNumber | number,
    ) => Promise<readonly AccountTransaction[]>
  }
}

function extendWeb3(web3: Web3): MantisWeb3 {
  web3.extend({
    property: 'mantis',
    methods: [
      {
        name: 'getAccountTransactions',
        call: 'mantis_getAccountTransactions',
        params: 3,
        inputFormatter: [
          // @ts-ignore
          formatters.inputAddressFormatter,
          // @ts-ignore
          formatters.inputDefaultBlockNumberFormatter,
          // @ts-ignore
          formatters.inputDefaultBlockNumberFormatter,
        ],
        // @ts-ignore
        outputFormatter: accountTransactionsFormatter,
      },
    ],
  })
  return web3 as MantisWeb3
}

export function createWeb3(url: URL): MantisWeb3 {
  const web3 = new Web3(new Web3.providers.HttpProvider(url.href))
  return extendWeb3(web3)
}

export const defaultWeb3 = (): MantisWeb3 => extendWeb3(new Web3())
