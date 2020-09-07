import {useEffect, useState} from 'react'
import _ from 'lodash/fp'
import {createContainer} from 'unstated-next'
import {none, some, Option, isNone, getOrElse} from 'fp-ts/lib/Option'
import {Remote} from 'comlink'
import {makeWeb3Worker, Web3API} from '../web3'
import {waitUntil} from '../shared/utils'
import {updateNetworkTag} from './ipc-util'

export interface BackendState {
  networkTag: Option<NetworkTag>
}

interface BackendStateParams {
  web3: Remote<Web3API>
  networkTag: Option<NetworkTag>
}

const DEFAULT_STATE: BackendStateParams = {
  web3: makeWeb3Worker(),
  networkTag: none,
}

export const getNetworkTagOrTestnet: (networkTag: Option<NetworkTag>) => NetworkTag = getOrElse(
  (): NetworkTag => 'testnet',
)

function useBackendState(initialState?: Partial<BackendStateParams>): BackendState {
  const _initialState = _.merge(DEFAULT_STATE)(initialState)
  const {config} = _initialState.web3

  const [networkTag, setNetworkTag] = useState(_initialState.networkTag)

  const loadNetworkTag = async (): Promise<boolean> => {
    try {
      const {networkTag} = await config.getNetworkTag()
      setNetworkTag(some(networkTag))
      updateNetworkTag(networkTag)
      return true
    } catch (e) {
      return false
    }
  }

  useEffect(() => {
    if (isNone(networkTag)) waitUntil(loadNetworkTag, 1000)
  }, [])

  return {
    networkTag,
  }
}

export const BackendState = createContainer(useBackendState)
