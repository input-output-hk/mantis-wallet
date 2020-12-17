import * as StoredHistory from './StoredHistory'
import {Store} from '../../common/store'
import {StoreWalletData} from '../../common/wallet-state'

export interface TxHistoryStoreData {
  txHistory?: StoredHistory.StoredHistory
}
export const defaultTxHistoryStoreData: TxHistoryStoreData = {
  txHistory: StoredHistory.empty,
}
export interface HistoryStore {
  getStoredHistory(): Promise<StoredHistory.StoredHistory>
  storeHistory(sh: StoredHistory.StoredHistory): Promise<void>
}
export const HistoryStore = (baseStore: Store<StoreWalletData>): HistoryStore => ({
  getStoredHistory: () => {
    return Promise.resolve(baseStore.get(['wallet', 'txHistory']) || StoredHistory.empty)
  },
  storeHistory: (sh: StoredHistory.StoredHistory) => {
    baseStore.set(['wallet', 'txHistory'], sh)
    return Promise.resolve()
  },
})
export const InMemoryHistoryStore = (
  initialState: StoredHistory.StoredHistory = StoredHistory.empty,
): HistoryStore => {
  // eslint-disable-next-line fp/no-let
  let state: StoredHistory.StoredHistory = initialState
  return {
    getStoredHistory: () => Promise.resolve(state),
    storeHistory: (sh: StoredHistory.StoredHistory) => {
      // eslint-disable-next-line fp/no-mutation
      state = sh
      return Promise.resolve()
    },
  }
}
