import {useEffect, useState} from 'react'
import _ from 'lodash/fp'
import {createContainer} from 'unstated-next'
import Web3 from 'web3'
import {none, some, Option, isNone, getOrElse} from 'fp-ts/lib/Option'
import {waitUntil} from '../shared/utils'
import {updateNetworkTag} from './ipc-util'

export interface BackendState {
  networkTag: Option<NetworkTag>
}

interface BackendStateParams {
  web3: Web3
  networkTag: Option<NetworkTag>
}

const DEFAULT_STATE: BackendStateParams = {
  web3: new Web3(),
  networkTag: none,
}

export const getNetworkTagOrTestnet: (networkTag: Option<NetworkTag>) => NetworkTag = getOrElse(
  (): NetworkTag => 'testnet',
)

function useBackendState(initialState?: Partial<BackendStateParams>): BackendState {
  const _initialState = _.merge(DEFAULT_STATE)(initialState)

  const [networkTag, setNetworkTag] = useState(_initialState.networkTag)

  const loadNetworkTag = async (): Promise<boolean> => {
    try {
      const protocolVersion = await _initialState.web3.eth.getProtocolVersion()
      // FIXME ETCM-112 we might want to show more info about version
      const networkTag = protocolVersion === '0x1' ? 'mainnet' : 'testnet'
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
