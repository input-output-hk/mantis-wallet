import {Dispatch, SetStateAction, useState} from 'react'
import {createContainer} from 'unstated-next'
import _ from 'lodash/fp'
import {updateNetworkName} from './ipc-util'
import {createInMemoryStore, Store} from './store'
import {NetworkName} from '../config/type'
import {usePersistedState, useRecurringTimeout} from './hook-utils'
import {config} from '../config/renderer'
import {defaultWeb3, MantisWeb3} from '../web3'

const BACKEND_CHECK_INTERVAL = 1000

export interface BackendState {
  isBackendRunning: boolean
  setBackendRunning: Dispatch<SetStateAction<boolean>>
  networkName: NetworkName
  setNetworkName: (networkName: NetworkName) => void
}

export interface StoreBackendData {
  networkName: NetworkName
}

interface BackendStateParams {
  web3: MantisWeb3
  store: Store<StoreBackendData>
}

export const defaultBackendData: StoreBackendData = {
  networkName: config.networkName,
}

const DEFAULT_PARAMS: BackendStateParams = {
  store: createInMemoryStore(defaultBackendData),
  web3: defaultWeb3(),
}

function useBackendState(params?: Partial<BackendStateParams>): BackendState {
  const {store, web3} = _.merge(DEFAULT_PARAMS)(params)
  const [isBackendRunning, setBackendRunning] = useState(false)
  const [networkName, _setNetworkName] = usePersistedState(store, 'networkName')

  useRecurringTimeout(async () => {
    try {
      await web3.eth.getProtocolVersion()
      setBackendRunning(true)
    } catch (e) {
      setBackendRunning(false)
    }
  }, BACKEND_CHECK_INTERVAL)

  const setNetworkName = (networkName: NetworkName): void => {
    _setNetworkName(networkName)
    setBackendRunning(false)
    updateNetworkName(networkName)
  }

  return {
    isBackendRunning,
    setBackendRunning,
    networkName,
    setNetworkName,
  }
}

export const BackendState = createContainer(useBackendState)

export const migrationsForBackendData = {
  '0.1.2-mantis-wallet': (store: Store<StoreBackendData>): void => {
    store.set('networkName', config.networkName)
  },
}
