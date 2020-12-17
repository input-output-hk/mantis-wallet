import web3 from 'web3'
import {pipe} from 'fp-ts/lib/function'
import _ from 'lodash/fp'
import {BlockHeader} from 'web3-eth'
import {FetchedBatch, Transaction, TransactionHistory} from '../TransactionHistory'
import {asEther, asWei} from '../../../common/units'
import {BatchRange} from '../BatchRange'

export const mkTransaction = (userData: Partial<Transaction>): Transaction => {
  const data: Omit<Transaction, 'hash'> = {
    direction: 'outgoing',
    status: 'pending',
    value: asEther(1),
    fee: asEther(0.1),
    // defaults:
    from: '0xffffffffffffffffffffffffffffffffffffffff',
    to: '0xffffffffffffffffffffffffffffffffffffffff',
    blockNumber: 1,
    timestamp: new Date(0),
    gasPrice: asWei(1),
    gas: 1,
    gasUsed: 1,
    contractAddress: null,
    ...userData,
  }

  return {
    ...data,
    hash:
      userData.hash ??
      pipe(
        data,
        _.pick(['value', 'fee', 'from', 'to', 'gasPrice', 'gas', 'direction', 'status']),
        Object.values,
        (arr) => arr.join(''),
        web3.utils.keccak256,
      ),
  }
}

export const mkBlockHeader = (userData: Partial<BlockHeader>): BlockHeader => {
  const data: Omit<BlockHeader, 'hash'> = {
    extraData: '',
    gasLimit: 0,
    gasUsed: 0,
    logsBloom: '',
    miner: '',
    nonce: '',
    number: 0,
    parentHash: '',
    receiptRoot: '',
    sha3Uncles: '',
    stateRoot: '',
    timestamp: 0,
    transactionRoot: '',
  }

  return {
    ...data,
    ...userData,
    hash: userData.hash ?? pipe(data, Object.values, (arr) => arr.join(''), web3.utils.keccak256),
  }
}

export const mkHistory = (history: Partial<TransactionHistory> = {}): TransactionHistory => ({
  lastCheckedBlock: 42,
  transactions: [],
  ...history,
})

export const mkBatch = (
  history: TransactionHistory,
  partialBatch: Partial<FetchedBatch> = {},
): FetchedBatch => ({
  blockRange: BatchRange.ofSize(history.lastCheckedBlock, 5, 'scan'),
  transactions: [],
  ...partialBatch,
})

export const mkAddress = (str: string): string => web3.utils.keccak256(str).substr(0, 22)
