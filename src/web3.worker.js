import Web3 from 'web3'
import * as Comlink from 'comlink'

const web3 = new Web3()
web3.setProvider(new web3.providers.HttpProvider('http://127.0.0.1:8342/'))
const {wallet} = web3.midnight

Comlink.expose(wallet)
