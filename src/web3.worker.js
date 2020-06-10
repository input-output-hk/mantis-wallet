/* eslint-disable */
import Web3 from 'web3'
import * as Comlink from 'comlink'
import _ from 'lodash'
import erc20abi from './assets/contracts/ERC20.json'
import {MIDNIGHT_TOKEN_CONTRACTS} from './pob/pob-config'

const web3 = new Web3()

onmessage = (message) => {
  if (message.data[0] === 'configure') {
    web3.setProvider(new web3.providers.HttpProvider(message.data[1]))
  }
}

const erc20ContractFactory = web3.eth.contract(erc20abi)
const erc20Contracts = _.toPairs(MIDNIGHT_TOKEN_CONTRACTS).map(([chainId, contractAddress]) => [
  chainId,
  erc20ContractFactory.at(contractAddress),
])

Comlink.expose({...web3, erc20: _.fromPairs(erc20Contracts)})
