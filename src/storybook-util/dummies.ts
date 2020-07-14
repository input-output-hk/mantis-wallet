import BigNumber from 'bignumber.js'
import {Transaction} from '../web3'
import {wait} from '../shared/utils'
import {FeeEstimates} from '../common/wallet-state'
import {PeriodConfig} from '../glacier-drop/glacier-state'

export const dummyTransactions: Transaction[] = [
  {
    hash: '1',
    txStatus: {
      status: 'confirmed',
      atBlock: '0xb70ef5',
      timestamp: 1585118001,
    },
    txDetails: {
      txType: 'call',
      transparentTransactionHash: '123456',
      usedTransparentAccountIndexes: [0],
      transparentTransaction: {
        nonce: '0x1',
        gasPrice: 123,
        gasLimit: '0x1185920',
        sendingAddress: 'm-test-uns-ad1rjfgdj6fewrhlv6j5qxeck38ms2t5szhrmg6v7',
        receivingAddress: 'm-test-uns-ad185v0zwhq92a3d230smap6sfxy9fjukgn7qs2q0',
        value: '123',
        payload: '0xPAYLOAD',
      },
    },
    txDirection: 'outgoing',
    txValue: {
      value: '0x2cc4d20',
      fee: '0x1708f6e',
    },
  },
  {
    hash: '2',
    txStatus: 'pending',
    txDetails: {
      txType: 'transfer',
    },
    txDirection: 'outgoing',
    txValue: {
      value: '0x4f5ab6c',
      fee: '0x0',
    },
  },
  {
    hash: '3',
    txStatus: {
      status: 'persisted',
      atBlock: '0xb70ef4',
      timestamp: 1585118000,
    },
    txDetails: {
      txType: 'transfer',
    },
    txDirection: 'incoming',
    txValue: '0x100441e',
  },
  {
    hash: '4',
    txStatus: 'pending',
    txDetails: {
      txType: 'transfer',
    },
    txDirection: 'incoming',
    txValue: '0x54708b',
  },
  {
    hash: '5',
    txStatus: 'failed',
    txDetails: {
      txType: 'transfer',
    },
    txDirection: 'outgoing',
    txValue: {
      value: '0x1cbb3d6',
      fee: '0x121f4c2',
    },
  },
  {
    hash: '6',
    txStatus: {
      status: 'confirmed',
      atBlock: '0xb70ef5',
      timestamp: 1585118001,
    },
    txDetails: {
      txType: 'coinbase',
    },
    txDirection: 'incoming',
    txValue: '0x11113a306',
  },
  {
    hash: '7',
    txStatus: 'pending',
    txDetails: {
      txType: 'transfer',
    },
    txDirection: 'incoming',
    txValue: '0x4c45dce',
  },
  {
    hash: '8',
    txStatus: 'pending',
    txDetails: {
      txType: 'transfer',
    },
    txDirection: 'outgoing',
    txValue: {
      value: '0x20ea4388',
      fee: '0x53bcf60',
    },
  },
  {
    hash: '9',
    txStatus: {
      status: 'confirmed',
      atBlock: '0xb70ef8',
      timestamp: 1585118004,
    },
    txDetails: {
      txType: 'call',
      transparentTransactionHash: '1234567',
      usedTransparentAccountIndexes: [0, 2],
      transparentTransaction: {
        nonce: '0x1',
        gasPrice: 123,
        gasLimit: '0x1185920',
        sendingAddress: 'third-transparent-address',
        receivingAddress: 'first-transparent-address',
        value: '1230',
        payload: '0xPAYLOAD',
      },
    },
    txDirection: 'outgoing',
    txValue: {
      value: '0x2cc4d205',
      fee: '0x1708f6e',
    },
  },
]

export const estimateFeesWithRandomDelay = (amount?: BigNumber): Promise<FeeEstimates> =>
  wait(Math.floor(Math.random() * Math.floor(200))).then(() =>
    Promise.resolve({
      low: new BigNumber(3).times(amount && !amount.isEqualTo(0) ? amount : 1),
      medium: new BigNumber(5).times(amount && !amount.isEqualTo(0) ? amount : 1),
      high: new BigNumber(7).times(amount && !amount.isEqualTo(0) ? amount : 1),
    }),
  )

export const DUMMY_PERIOD_CONFIG: PeriodConfig = {
  unlockingStartBlock: 100,
  unlockingEndBlock: 200,
  unfreezingStartBlock: 300,
  numberOfEpochs: 10,
  epochLength: 10,
}

export const CONFIDENTIAL_ADDRESS =
  'm-test-shl-ad100hqhl0uks8tneln0z7rzfd962p84v3uk22grrzqh48laq53pugqjjymwyed9twecujgw7jdvy5'

export const TRANSPARENT_ADDRESSES = [
  {
    address: 'm-test-uns-ad1j7ty84rlktw82amh99ls8rjpxht7k592kpd25v',
    index: 6,
  },
  {
    address: 'm-test-uns-ad170ygzstqc4rcfl7m0ap9yfnkrw83s73q2tnq28',
    index: 5,
  },
  {
    address: 'm-test-uns-ad1slvftjj2zrl3mr9mlgcxlq5n9v4dhnmdwlkztg',
    index: 4,
  },
  {
    address: 'm-test-uns-ad16t52pjs3llcjeykuhu3hw9s44txp3z2map09gq',
    index: 3,
  },
  {
    address: 'm-test-uns-ad1pz4h6hzmg8xtkdy5jg592umjer8hc8tyduzd2s',
    index: 2,
  },
  {
    address: 'm-test-uns-ad18r8gdnwae96ugqlzdw0py57qw70lpacr6mff8e',
    index: 1,
  },
  {
    address: 'm-test-uns-ad1rjfgdj6fewrhlv6j5qxeck38ms2t5szhrmg6v7',
    index: 0,
  },
]
