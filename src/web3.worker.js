/* eslint-disable */
import Web3 from 'web3'
import * as Comlink from 'comlink'
import _ from 'lodash'
import erc20json from './assets/contracts/ERC20.json'
import {CHAINS} from './pob/chains.ts'

const web3 = new Web3()

onmessage = (message) => {
  if (message.data[0] === 'configure') {
    web3.setProvider(new web3.providers.HttpProvider(message.data[1]))
  }
}

const erc20ContractFactory = web3.eth.contract(erc20json.abi)
const erc20Contracts = _.values(CHAINS).map(({id, contractAddress}) => [
  id,
  erc20ContractFactory.at(contractAddress),
])

Comlink.expose({...web3, erc20: _.fromPairs(erc20Contracts)})
