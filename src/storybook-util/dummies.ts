import BigNumber from 'bignumber.js'
import {wait} from '../shared/utils'
import {FeeEstimates, TransparentAccount, Transaction} from '../common/wallet-state'
import {Token} from '../tokens/tokens-state'
import {asWei, asEther} from '../common/units'

const address1 = '0x00112233445566778899aabbccddeeff00112233'
const address2 = '0xffeeddccbbaa0011223344556677889988776655'
export const dummyTransactions: Transaction[] = [
  {
    hash: '1',
    from: address1,
    to: address2,
    blockNumber: 1,
    timestamp: new Date(1585118001),
    value: asEther(123),
    gasPrice: asWei(1e9),
    gas: 21000,
    gasUsed: 21000,
    fee: asWei(0),
    direction: 'incoming',
    status: 'persisted',
  },
  {
    hash: '2',
    from: address1,
    to: address2,
    blockNumber: 1,
    timestamp: new Date(1585118200),
    value: asEther(123),
    gasPrice: asWei(1e9),
    gas: 21000,
    gasUsed: 21000,
    fee: asWei(0),
    direction: 'incoming',
    status: 'confirmed',
  },
  {
    hash: '3',
    from: address2,
    to: address1,
    blockNumber: null,
    timestamp: null,
    value: asEther(123456789),
    gasPrice: asWei(1e9),
    gas: 21000,
    gasUsed: null,
    fee: asWei(21000 * 1e9),
    direction: 'outgoing',
    status: 'pending',
  },
  {
    hash: '4',
    from: address2,
    to: address1,
    blockNumber: null,
    timestamp: null,
    value: asEther(123456789),
    gasPrice: asWei(1e9),
    gas: 21000,
    gasUsed: null,
    fee: asWei(21000 * 1e9),
    direction: 'outgoing',
    status: 'failed',
  },
]

export const estimateFeesWithRandomDelay = (amount?: BigNumber): Promise<FeeEstimates> =>
  wait(Math.floor(Math.random() * Math.floor(200))).then(() =>
    Promise.resolve({
      low: asWei(new BigNumber(30000000000).times(amount && !amount.isEqualTo(0) ? amount : 1)),
      medium: asWei(new BigNumber(50000000000).times(amount && !amount.isEqualTo(0) ? amount : 1)),
      high: asWei(new BigNumber(70000000000).times(amount && !amount.isEqualTo(0) ? amount : 1)),
    }),
  )

export const ADDRESS = '0x3b20f0bcc64671d8d758f3469ec5ce4c8484a872'

const FIRST_ERC20_TOKEN_ADDRESS = 'm-test-uns-ad1rjfgdj6fewrhlv6j5qxeck38ms2t5szhrmg6v6'

export const dummyTransparentAccounts: TransparentAccount[] = [
  {
    address: 'm-test-uns-ad1j7ty84rlktw82amh99ls8rjpxht7k592kpd25v',
    index: 6,
    tokens: {[FIRST_ERC20_TOKEN_ADDRESS]: new BigNumber(1e5)},
    balance: new BigNumber(9e8),
  },
  {
    address: 'm-test-uns-ad170ygzstqc4rcfl7m0ap9yfnkrw83s73q2tnq28',
    index: 5,
    tokens: {[FIRST_ERC20_TOKEN_ADDRESS]: new BigNumber(50)},
    balance: new BigNumber(250e8),
  },
  {
    address: 'm-test-uns-ad1slvftjj2zrl3mr9mlgcxlq5n9v4dhnmdwlkztg',
    index: 4,
    tokens: {[FIRST_ERC20_TOKEN_ADDRESS]: new BigNumber(600)},
    balance: new BigNumber(500),
  },
  {
    address: 'm-test-uns-ad16t52pjs3llcjeykuhu3hw9s44txp3z2map09gq',
    index: 3,
    tokens: {[FIRST_ERC20_TOKEN_ADDRESS]: new BigNumber(1234)},
    balance: new BigNumber(5.5e8),
  },
  {
    address: 'm-test-uns-ad1pz4h6hzmg8xtkdy5jg592umjer8hc8tyduzd2s',
    index: 2,
    tokens: {},
    balance: new BigNumber(0),
  },
  {
    address: 'm-test-uns-ad18r8gdnwae96ugqlzdw0py57qw70lpacr6mff8e',
    index: 1,
    tokens: {},
    balance: new BigNumber(0),
  },
  {
    address: 'm-test-uns-ad1rjfgdj6fewrhlv6j5qxeck38ms2t5szhrmg6v7',
    index: 0,
    tokens: {},
    balance: new BigNumber(0),
  },
]

export const dummyERC20Tokens: Token[] = [
  {
    symbol: 'SYM',
    name: 'Awesome ERC20 token',
    decimals: 4,
    address: FIRST_ERC20_TOKEN_ADDRESS,
  },
  {
    symbol: 'SY2',
    name: 'Second awesome ERC20 token',
    decimals: 8,
    address: 'm-test-uns-ad1rjfgdj6fewrhlv6j5qxeck38ms2t5szhrmg6v8',
  },
]
