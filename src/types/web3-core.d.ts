import 'web3-core'

// Mantis returns extra properties for the Transaction object
// This change will extend web3's Transaction type definition
declare module 'web3-core' {
  interface Transaction {
    pending: boolean | null
    isOutgoing: boolean | null
  }
}
