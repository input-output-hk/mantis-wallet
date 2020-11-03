import {Dispatch, SetStateAction, useEffect, useState} from 'react'
import {createContainer} from 'unstated-next'
import Web3 from 'web3'
import _ from 'lodash/fp'
import {updateNetworkName} from './ipc-util'
import {rendererLog} from './logger'
import {createInMemoryStore, Store} from './store'
import {NetworkName} from '../config/type'
import {usePersistedState} from './hook-utils'
import {config} from '../config/renderer'

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
  web3: Web3
  store: Store<StoreBackendData>
}

export const defaultBackendData: StoreBackendData = {
  networkName: config.networkName,
}

const DEFAULT_PARAMS: BackendStateParams = {
  store: createInMemoryStore(defaultBackendData),
  web3: new Web3(),
}

function useBackendState(params?: Partial<BackendStateParams>): BackendState {
  const {store, web3} = _.merge(DEFAULT_PARAMS)(params)
  const [isBackendRunning, setBackendRunning] = useState(false)
  const [networkName, _setNetworkName] = usePersistedState(store, 'networkName')

  useEffect(() => {
    const checkBackend = async (): Promise<void> => {
      try {
        await web3.eth.getProtocolVersion()
        setBackendRunning(true)
        setTimeout(checkBackend, 5000)
      } catch (e) {
        setBackendRunning(false)
        setTimeout(checkBackend, 1000)
      }
    }

    rendererLog.info('Mantis Wallet renderer started')
    checkBackend()
  }, [])

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
