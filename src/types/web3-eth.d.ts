import 'web3-eth'
import {Transaction, BlockNumber} from 'web3-core'

declare module 'web3-eth' {
  export interface SyncingFixed {
    startingBlock: number
    currentBlock: number
    highestBlock: number
    knownStates: number
    pulledStates: number
  }
  interface Eth {
    getAccountTransactions: (
      address: string,
      from: BlockNumber,
      to: BlockNumber,
    ) => Promise<Transaction[]>

    isSyncing(
      callback?: (error: Error, syncing: SyncingFixed) => void,
    ): Promise<SyncingFixed | boolean>
  }
}
