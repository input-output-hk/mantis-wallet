export interface BigNumberJSON {
  s: number
  e: number
  c: number[]
}

export interface Balance {
  availableBalance: BigNumberJSON
  totalBalance: BigNumberJSON
}

export interface TransparentAddress {
  address: string
  index: number
}

export interface Transaction {
  hash: string // Hash of transaction
  txDirection: 'incoming' | 'outgoing'
  txStatus: {
    status: 'confirmed' | 'pending'
    atBlock?: string // hexadecimal value representing block at which transaction took place
  }
  txValue: string
  txDetails: {
    txType: 'transfer' | 'coinbase' | 'redeem' | 'call'
  }
}

interface PassphraseSecrets {
  passphrase: string
}

interface SpendingKey {
  spendingKey: string
}

interface SeedPhrase {
  seedPhrase: string[]
}

interface Account {
  wallet: string
  address: string
  locked: boolean
}

export interface WalletAPI {
  getBalance(): Balance
  getTransparentWalletBalance(address: string): Balance
  getTransactionHistory(count: number, drop: number): Transaction[]
  listTransparentAddresses(count: number, drop: number): TransparentAddress[]
  listAccounts(): Account[]
  sendTransaction(recipient: string, amount: number, fee: number): string
  create(secrets: PassphraseSecrets): SpendingKey & SeedPhrase
  restore(secrets: (SpendingKey | SeedPhrase) & PassphraseSecrets): boolean
  // FIXME: lock/unlock -> union (true | false) return type breaks downstream promise code
  // https://github.com/microsoft/TypeScript/issues/14669
  lock(secrets: PassphraseSecrets): boolean
  unlock(secrets: PassphraseSecrets): boolean
}
