import Web3 from 'web3'
import * as Comlink from 'comlink'

class Web3Wrapper {
    constructor() {
        this.web3 = new Web3();
    }

    configure(rpcAddress) {
        this.web3.setProvider(new this.web3.providers.HttpProvider(rpcAddress))
    }

    getWallet() {
        return this.web3.midnight.wallet;
    }
}

Comlink.expose(new Web3Wrapper())
