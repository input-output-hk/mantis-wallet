import {Dispatch, SetStateAction} from 'react'
import {NetworkName} from '../../../config/type'
import {MantisWeb3} from '../../../web3'
import {Store} from '../store'

export interface BackendState {
  isBackendRunning: boolean
  setBackendRunning: Dispatch<SetStateAction<boolean>>
  networkName: NetworkName
  setNetworkName: (networkName: NetworkName) => void
}

export interface StoreBackendData {
  networkName: NetworkName
}

export interface BackendStateParams {
  web3: MantisWeb3
  store: Store<StoreBackendData>
}
