/* eslint-disable fp/no-mutation */
/* eslint-disable fp/no-mutating-methods */
import BigNumber from 'bignumber.js'
import _ from 'lodash'
import {
  Web3API,
  PassphraseSecrets,
  SpendingKey,
  SeedPhrase,
  Balance,
  Account,
  Transaction,
  TransparentAddress,
  SynchronizationStatus,
  BigNumberJSON,
  ERC20Contract,
  EthTransaction,
} from './web3'
import {toHex} from './common/util'
import {WALLET_DOES_NOT_EXIST, WALLET_IS_LOCKED, WALLET_ALREADY_EXISTS} from './common/errors'
import {CHAINS, ChainId} from './pob/chains'

const HIGHEST_KNOWN_BLOCK = 1000
const ADDRESS =
  'm-test-shl-ad1x63kqrmyyuqxf38pqu4dxmf4mjfruncv0mpjsfkqug68jp2eqjv9mpdfn49n7g3p37t3jvxmuv5'
const TRANSPARENT_ADDRESS: TransparentAddress = {
  address: 'm-test-uns-ad17upzkhnpmuenuhk3lnrc64q5kr0l3ez44g8u7r',
  index: 0,
}

class MockWallet {
  currentBlock = 0
  walletExists = true
  isLocked = false
  passphrase = ''
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
    if (this.walletExists) throw new Error(WALLET_ALREADY_EXISTS)
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

  // balances
  getBalance(): Balance {
    this._lockGuard()
    return {
      availableBalance: new BigNumber(100_000_000) as BigNumberJSON,
      totalBalance: new BigNumber(250_000_000) as BigNumberJSON,
    }
  }
  getTransparentWalletBalance(_address: string): Balance {
    this._lockGuard()
    return {
      availableBalance: new BigNumber(100_000_00) as BigNumberJSON,
      totalBalance: new BigNumber(250_000_000) as BigNumberJSON,
    }
  }

  // transactions
  sendTransaction(recipient: string, amount: number, fee: number): string {
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
      },
    })
    return ''
  }
  getTransactionHistory(): Transaction[] {
    this._lockGuard()
    return this.transactions
  }

  // transparent addresses
  listTransparentAddresses(): TransparentAddress[] {
    this._lockGuard()
    return [TRANSPARENT_ADDRESS]
  }
  generateTransparentAddress(): TransparentAddress {
    this._lockGuard()
    return TRANSPARENT_ADDRESS
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

  getSynchronizationStatus(): SynchronizationStatus {
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

const mockErc20Contracts = _.values(CHAINS).map(({id}): [ChainId, ERC20Contract] => [
  id,
  {balanceOf: () => new BigNumber(1) as BigNumberJSON},
])

export const Web3MockApi: Web3API = {
  eth: {
    getTransaction: (hash: string): EthTransaction => {
      return {
        hash,
        blockNumber: 2,
      }
    },
  },
  midnight: {
    wallet: new MockWallet(),
  },
  version: {
    ethereum: 'mocked',
  },
  erc20: _.fromPairs(mockErc20Contracts) as Record<ChainId, ERC20Contract>,
}
