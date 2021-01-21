import _ from 'lodash/fp'
import * as StoredHistory from './StoredHistory'
import {Store} from '../../common/store'
import {StoreWalletData} from '../../common/wallet-state'
import {NetworkName} from '../../config/type'

export interface TxHistoryStoreData {
  txHistory: Record<NetworkName, StoredHistory.StoredHistory>
}
export const defaultTxHistoryStoreData: TxHistoryStoreData = {
  txHistory: {},
}
export interface HistoryStore {
  getStoredHistory(): Promise<StoredHistory.StoredHistory>
  storeHistory(sh: StoredHistory.StoredHistory): Promise<void>
}
export interface HistoryStoreFactory {
  getStore(n: NetworkName): HistoryStore
  clean(): Promise<void>
}

export const historyStoreFactory = (baseStore: Store<StoreWalletData>): HistoryStoreFactory => ({
  getStore: (networkName): HistoryStore => ({
    getStoredHistory: async () =>
      Promise.resolve(baseStore.get(['wallet', 'txHistory', networkName])).then((value) =>
        _.isEqual(value, {}) || _.isNil(value) ? StoredHistory.empty : value,
      ),
    storeHistory: (sh: StoredHistory.StoredHistory) => {
      baseStore.set(['wallet', 'txHistory', networkName], sh)
      return Promise.resolve()
    },
  }),
  clean: () => {
    baseStore.set(['wallet', 'txHistory'], {})
    return Promise.resolve()
  },
})

// To be used in tests
export const inMemoryHistoryStoreFactory = (
  initialState: Record<NetworkName, StoredHistory.StoredHistory | undefined> = {},
): HistoryStoreFactory => {
  // eslint-disable-next-line fp/no-let
  let state: Record<NetworkName, StoredHistory.StoredHistory | undefined> = initialState
  return {
    getStore: (networkName) => {
      return {
        getStoredHistory: () => Promise.resolve(state[networkName] || StoredHistory.empty),
        storeHistory: (sh: StoredHistory.StoredHistory) => {
          // eslint-disable-next-line fp/no-mutation
          state[networkName] = sh
          return Promise.resolve()
        },
      }
    },
    clean: () => {
      // eslint-disable-next-line fp/no-mutation
      state = {}
      return Promise.resolve()
    },
  }
}
