import 'web3-eth'

declare module 'web3-eth' {
  export interface SyncingFixed {
    startingBlock: number
    currentBlock: number
    highestBlock: number
    knownStates: number
    pulledStates: number
  }
  interface Eth {
    isSyncing(
      callback?: (error: Error, syncing: SyncingFixed) => void,
    ): Promise<SyncingFixed | false>
  }
}
