import 'web3-eth'
import {Transaction, BlockNumber} from 'web3-core'

declare module 'web3-eth' {
  interface Eth {
    getAccountTransactions: (
      address: string,
      from: BlockNumber,
      to: BlockNumber,
    ) => Promise<Transaction[]>
  }
}
