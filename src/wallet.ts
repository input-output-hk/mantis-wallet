import * as Comlink from 'comlink'
import {MockWorker} from './stubs'
import {config} from './config/renderer'

// for testing: ReactDOM doesn't know about workers
if (window.Worker === undefined) {
  // eslint-disable-next-line
  window.Worker = MockWorker
}

const worker = new Worker('./web3.worker.js', {type: 'module'})
worker.postMessage(['configure', config.rpcAddress])
// FIXME: remove any, see WalletAPI for details
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const wallet: any = Comlink.wrap(worker)
