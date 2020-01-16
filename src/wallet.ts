import * as Comlink from 'comlink'
import {MockWorker} from './stubs'

// for testing: ReactDOM doesn't know about workers
if (window.Worker === undefined) {
  // eslint-disable-next-line
  window.Worker = MockWorker
}

const worker = new Worker('./web3.worker.js', {type: 'module'})
export const wallet: any = Comlink.wrap(worker)
