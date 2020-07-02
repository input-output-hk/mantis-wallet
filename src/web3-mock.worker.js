/* eslint-disable */
import {Web3MockApi} from './web3-mock-api'
import * as Comlink from 'comlink'
import {rendererLogger} from './common/logger'

onmessage = (message) => {
  if (message.data[0] === 'configure') {
    rendererLogger.info('setProvider', message.data[1])
  }
}

Comlink.expose(Web3MockApi)
