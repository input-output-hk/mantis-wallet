import * as Comlink from 'comlink'
import {MockWorker} from './stubs'
import {WalletAPI} from './web3'
import { config } from './config'

// for testing: ReactDOM doesn't know about workers
if (window.Worker === undefined) {
  // eslint-disable-next-line
  window.Worker = MockWorker
}

// FIXME: remove any, see WalletAPI for details
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const worker: any = Comlink.wrap(new Worker('./web3.worker.js', {type: 'module'}));
export const walletPromise: Promise<WalletAPI> = worker.configure(config.rpcAddress).then(() => worker.getWallet());
