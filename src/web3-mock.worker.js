/* eslint-disable */
import {Web3MockApi} from './web3-mock-api'
import * as Comlink from 'comlink'

onmessage = (message) => {
  if (message.data[0] === 'configure') {
    console.log('setProvider', message.data[1])
  }
}

Comlink.expose(Web3MockApi)
