import * as Comlink from 'comlink'
import {MockWorker} from './stubs'
import {WalletAPI} from './web3'

// for testing: ReactDOM doesn't know about workers
if (window.Worker === undefined) {
  // eslint-disable-next-line
  window.Worker = MockWorker
}

const worker = new Worker('./web3.worker.js', {type: 'module'})
export const wallet = Comlink.wrap<WalletAPI>(worker)
