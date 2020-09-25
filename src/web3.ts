/* eslint-disable @typescript-eslint/ban-ts-ignore */
import _ from 'lodash'
import Web3 from 'web3'
import {formatters} from 'web3-core-helpers'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const outputTransactionsFormatter = (output: any): any => {
  if (_.isArray(output?.transactions)) {
    return output.transactions.map(formatters.outputTransactionFormatter)
  }

  return []
}

export function createWeb3(url: URL): Web3 {
  const web3 = new Web3(new Web3.providers.HttpProvider(url.href))
  web3.eth.extend({
    methods: [
      {
        name: 'getAccountTransactions',
        call: 'daedalus_getAccountTransactions', // FIXME ETCM-135
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
        outputFormatter: outputTransactionsFormatter,
      },
    ],
  })
  return web3
}
