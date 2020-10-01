import {useEffect, useState} from 'react'
import _ from 'lodash/fp'
import {createContainer} from 'unstated-next'
import Web3 from 'web3'
import {none, some, Option, isNone} from 'fp-ts/lib/Option'
import {waitUntil} from '../shared/utils'
import {updateNetworkType} from './ipc-util'

export interface BackendState {
  networkType: Option<string>
}

interface BackendStateParams {
  web3: Web3
  networkType: Option<string>
}

const DEFAULT_STATE: BackendStateParams = {
  web3: new Web3(),
  networkType: none,
}

function useBackendState(initialState?: Partial<BackendStateParams>): BackendState {
  const _initialState = _.merge(DEFAULT_STATE)(initialState)

  const [networkType, setNetworkType] = useState(_initialState.networkType)

  const loadNetworkType = async (): Promise<boolean> => {
    try {
      const networkType = await _initialState.web3.eth.net.getNetworkType()
      setNetworkType(some(networkType))
      updateNetworkType(networkType)
      return true
    } catch (e) {
      return false
    }
  }

  useEffect(() => {
    if (isNone(networkType)) waitUntil(loadNetworkType, 1000)
  }, [])

  return {
    networkType,
  }
}

export const BackendState = createContainer(useBackendState)
