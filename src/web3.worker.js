/* eslint-disable */
import Web3 from 'web3'
import * as Comlink from 'comlink'
import _ from 'lodash'

const web3 = new Web3()

onmessage = (message) => {
  if (message.data[0] === 'configure') {
    web3.setProvider(new web3.providers.HttpProvider(message.data[1]))
  }
}

Comlink.expose(web3)
