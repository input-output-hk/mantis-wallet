import {MockWorker} from './stubs'

if (window.Worker === undefined) {
  // eslint-disable-next-line
  window.Worker = MockWorker
}

export const mockWeb3Worker = new Worker('./web3-mock.worker.js', {type: 'module'})
