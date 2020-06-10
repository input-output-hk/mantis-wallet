import {useEffect, useState} from 'react'
import _ from 'lodash/fp'
import {createContainer} from 'unstated-next'
import {none, some, Option} from 'fp-ts/lib/Option'
import {Remote} from 'comlink'
import {makeWeb3Worker, Web3API} from '../web3'

export interface BackendState {
  refresh(): Promise<void>
  hashrate: Option<number>
  isMining: Option<boolean>
}

interface BackendStateParams {
  web3: Remote<Web3API>
  hashrate: Option<number>
  isMining: Option<boolean>
}

const DEFAULT_STATE: BackendStateParams = {
  web3: makeWeb3Worker(),
  hashrate: none,
  isMining: none,
}

function useBackendState(initialState?: Partial<BackendStateParams>): BackendState {
  const _initialState = _.merge(DEFAULT_STATE)(initialState)
  const {eth} = _initialState.web3

  const [hashrate, setHashrate] = useState<Option<number>>(_initialState.hashrate)
  const [isMining, setMining] = useState<Option<boolean>>(_initialState.isMining)

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

  useEffect(() => {
    refresh()
  }, [])

  return {
    refresh,
    hashrate,
    isMining,
  }
}

export const BackendState = createContainer(useBackendState)
