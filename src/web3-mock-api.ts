/* eslint-disable fp/no-mutation */
/* eslint-disable fp/no-mutating-methods */
import BigNumber from 'bignumber.js'
import {
  Web3API,
  PassphraseSecrets,
  SpendingKey,
  SeedPhrase,
  Balance,
  Account,
  Transaction,
  TransparentAddress,
  RawSynchronizationStatus,
  BigNumberJSON,
  EthTransaction,
  CallParams,
  WalletAPI,
  FeeLevel,
  JobStatus,
  AsyncTxResponse,
  EthBlock,
  PrivateAddress,
} from './web3'
import {toHex} from './common/util'
import {WALLET_DOES_NOT_EXIST, WALLET_IS_LOCKED, WALLET_ALREADY_EXISTS} from './common/errors'

const HIGHEST_KNOWN_BLOCK = 1000
const ADDRESS =
  'm-test-shl-ad1x63kqrmyyuqxf38pqu4dxmf4mjfruncv0mpjsfkqug68jp2eqjv9mpdfn49n7g3p37t3jvxmuv5'
const TRANSPARENT_ACCOUNT: TransparentAddress = {
  address: 'm-test-uns-ad17upzkhnpmuenuhk3lnrc64q5kr0l3ez44g8u7r',
  index: 0,
}
const PRIVATE_ACCOUNT: TransparentAddress = {
  address: ADDRESS,
  index: 0,
}
const JOB_STATUS: JobStatus = {
  status: 'building',
  hash: 'job_hash',
  txType: 'transfer',
}
const ASYNC_TX_RESPONSE: AsyncTxResponse = {
  message: 'transactionScheduledToBuild',
  jobHash: 'abcdef',
}

class MockWallet implements WalletAPI {
  currentBlock = 0
  walletExists = true
  isLocked = false
  passphrase = 'Foobar1234'
  transactions: Transaction[] = []

  create(secrets: PassphraseSecrets): SpendingKey & SeedPhrase {
    this._create(secrets.passphrase)
    return {
      spendingKey: 'spendingKey',
      seedPhrase: ['seedPhrase'],
    }
  }
  restoreFromSeedPhrase(secrets: SeedPhrase & PassphraseSecrets): boolean {
    return this._create(secrets.passphrase)
  }
  restoreFromSpendingKey(secrets: SpendingKey & PassphraseSecrets): boolean {
    return this._create(secrets.passphrase)
  }

  _create(passphrase: string): boolean {
    if (this.walletExists) throw Error(WALLET_ALREADY_EXISTS)
    this.walletExists = true
    this.passphrase = passphrase
    return true
  }

  lock({passphrase}: PassphraseSecrets): boolean {
    this._existGuard()
    if (passphrase === this.passphrase) this.isLocked = true
    return this.isLocked
  }
  unlock({passphrase}: PassphraseSecrets): boolean {
    this._existGuard()
    if (passphrase === this.passphrase) this.isLocked = false
    return !this.isLocked
  }

  remove({passphrase}: PassphraseSecrets): boolean {
    this._existGuard()
    if (passphrase === this.passphrase) this.walletExists = false
    return !this.walletExists
  }

  getSpendingKey({passphrase}: PassphraseSecrets): SpendingKey {
    this._existGuard()
    this._lockGuard()
    if (passphrase === this.passphrase) throw Error('Incorrect passowrd')
    return {spendingKey: 'test-spending-key'}
  }

  // balances
  getPrivateBalance(): Balance {
    this._lockGuard()
    return {
      availableBalance: new BigNumber(100_000_000) as BigNumberJSON,
      totalBalance: new BigNumber(250_000_000) as BigNumberJSON,
    }
  }
  getTransparentWalletBalance(_address: string): string {
    this._lockGuard()
    return toHex(12345)
  }

  // transactions
  sendTransaction(
    recipient: string,
    amount: number,
    fee: number,
    memo: ['text', string],
  ): AsyncTxResponse {
    this._lockGuard()
    this.transactions.push({
      hash: this.transactions.length.toString(),
      txDirection: 'outgoing',
      txStatus: 'pending',
      txValue: {
        value: toHex(amount),
        fee: toHex(fee),
      },
      txDetails: {
        txType: 'transfer',
        memo,
      },
    })
    return ASYNC_TX_RESPONSE
  }

  redeemValue(): AsyncTxResponse {
    this._lockGuard()
    return ASYNC_TX_RESPONSE
  }

  callContract(_contractParams: CallParams): AsyncTxResponse {
    this._lockGuard()
    return ASYNC_TX_RESPONSE
  }

  getTransactionHistory(): Transaction[] {
    this._lockGuard()
    return this.transactions
  }

  estimateGas(_callParams: CallParams): number {
    return 10000
  }

  estimateFees(_txType: string, _amount: number | CallParams): Record<FeeLevel, string> {
    return {
      low: '0x100',
      medium: '0x200',
      high: '0x300',
    }
  }

  calculateGasPrice(_txType: string, _fee: number, _amount: CallParams): number {
    return 100
  }

  // build job statuses

  getTransactionBuildJobStatus(jobHash: string): JobStatus {
    return {...JOB_STATUS, hash: jobHash}
  }
  getAllTransactionBuildJobStatuses(): JobStatus[] {
    return [JOB_STATUS]
  }

  // transparent accounts

  listTransparentAccounts(): TransparentAddress[] {
    this._lockGuard()
    return [TRANSPARENT_ACCOUNT]
  }
  generateTransparentAccount(): TransparentAddress {
    this._lockGuard()
    return TRANSPARENT_ACCOUNT
  }

  // private accounts

  listPrivateAccounts(): PrivateAddress[] {
    this._lockGuard()
    return [PRIVATE_ACCOUNT]
  }
  generatePrivateAccount(): PrivateAddress {
    this._lockGuard()
    return PRIVATE_ACCOUNT
  }

  // accounts

  listAccounts(): Account[] {
    const wallet = 'Wallet 1'
    if (this.isLocked) {
      return [{wallet, locked: true}]
    } else {
      return [{wallet, locked: false, address: ADDRESS}]
    }
  }

  getSynchronizationStatus(): RawSynchronizationStatus {
    this._existGuard()
    this.currentBlock += 1
    return {
      mode: 'online',
      currentBlock: toHex(this.currentBlock),
      highestKnownBlock: toHex(HIGHEST_KNOWN_BLOCK),
      percentage: Math.round((this.currentBlock / HIGHEST_KNOWN_BLOCK) * 100.0),
    }
  }

  getBurnAddress(
    _address: string,
    _chainId: number,
    _reward: number,
    _autoConversion: boolean,
  ): string {
    this._lockGuard()
    return 'example-burn-address'
  }

  _existGuard(): void {
    if (!this.walletExists) throw Error(WALLET_DOES_NOT_EXIST)
  }

  _lockGuard(): void {
    this._existGuard()
    if (this.isLocked) throw Error(WALLET_IS_LOCKED)
  }
}

export const Web3MockApi: Web3API = {
  eth: {
    getTransaction: (hash: string): EthTransaction => ({
      hash,
      blockNumber: 2,
    }),
    getBlock: (number: number): EthBlock => ({
      number,
      timestamp: toHex(new Date(2020, 4, 17, 3, 24, 0).getTime()),
    }),
    getTransactionReceipt: () => null,
    call: () => '0x1',
    getGasPriceEstimation: (): Record<FeeLevel, number> => ({
      low: 1,
      medium: 2,
      high: 3,
    }),
    mining: true,
    hashrate: 3000000,
  },
  midnight: {
    wallet: new MockWallet(),
  },
  version: {
    ethereum: 'mocked',
  },
  config: {
    getNetworkTag: () => ({networkTag: 'testnet'}),
  },
}
