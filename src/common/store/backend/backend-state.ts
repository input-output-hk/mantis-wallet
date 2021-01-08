import {useEffect, useState} from 'react'
import {createContainer} from 'unstated-next'
import _ from 'lodash/fp'
import {updateNetworkName} from '../../ipc-util'
import {rendererLog} from '../../logger'
import {NetworkName} from '../../../config/type'
import {usePersistedState} from '../../hook-utils'
import {defaultWeb3} from '../../../web3'
import {createInMemoryStore} from '../store'
import {BackendStateParams, BackendState} from './types'
import {defaultBackendData} from './data'

const DEFAULT_PARAMS: BackendStateParams = {
  store: createInMemoryStore(defaultBackendData),
  web3: defaultWeb3(),
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

export const _BackendState = createContainer(useBackendState)
