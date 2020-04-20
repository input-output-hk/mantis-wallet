declare class Web3 {
  constructor()
  eth: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contract: any
  }
}

declare module 'web3' {
  export = Web3
}
