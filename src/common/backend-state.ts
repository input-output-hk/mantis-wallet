import {useEffect, useState} from 'react'
import _ from 'lodash/fp'
import {createContainer} from 'unstated-next'
import {none, some, Option} from 'fp-ts/lib/Option'
import {Remote} from 'comlink'
import {makeWeb3Worker, Web3API} from '../web3'
import {waitUntil} from '../shared/utils'
import {updateNetworkTag} from './ipc-util'

export interface BackendState {
  refresh(): Promise<void>
  hashrate: Option<number>
  isMining: Option<boolean>
  networkTag: Option<NetworkTag>
}

interface BackendStateParams {
  web3: Remote<Web3API>
  hashrate: Option<number>
  isMining: Option<boolean>
  networkTag: Option<NetworkTag>
}

const DEFAULT_STATE: BackendStateParams = {
  web3: makeWeb3Worker(),
  hashrate: none,
  isMining: none,
  networkTag: none,
}

function useBackendState(initialState?: Partial<BackendStateParams>): BackendState {
  const _initialState = _.merge(DEFAULT_STATE)(initialState)
  const {eth, config} = _initialState.web3

  const [hashrate, setHashrate] = useState<Option<number>>(_initialState.hashrate)
  const [isMining, setMining] = useState<Option<boolean>>(_initialState.isMining)
  const [networkTag, setNetworkTag] = useState(_initialState.networkTag)

  const refresh = async (): Promise<void> => {
    try {
      const isMining = await eth.mining
      const hashrate = await eth.hashrate
      setMining(some(isMining))
      setHashrate(some(hashrate))
    } catch (e) {
      console.error(e)
      setMining(none)
      setHashrate(none)
    }
  }

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
    refresh()
    waitUntil(loadNetworkTag, 1000)
  }, [])

  return {
    refresh,
    hashrate,
    isMining,
    networkTag,
  }
}

export const BackendState = createContainer(useBackendState)
