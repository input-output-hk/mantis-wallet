import BigNumber from 'bignumber.js'
import {wait} from '../shared/utils'
import {FeeEstimates, Account, Transaction} from '../common/wallet-state'
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
    contractAddress: null,
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
    contractAddress: null,
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
    contractAddress: null,
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
    contractAddress: null,
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

const FIRST_ERC20_TOKEN_ADDRESS = '0x0001112223334445556667778889990123456789'

export const dummyAccounts: Account[] = [
  {
    address: '0x3b20f0bcc64671d8d758f3469ec5ce4c8484a873',
    index: 6,
    tokens: {[FIRST_ERC20_TOKEN_ADDRESS]: new BigNumber(1e5)},
    balance: asEther(9),
  },
  {
    address: '0x3b20f0bcc64671d8d758f3469ec5ce4c8484a874',
    index: 5,
    tokens: {[FIRST_ERC20_TOKEN_ADDRESS]: new BigNumber(50)},
    balance: asEther(250),
  },
  {
    address: '0x3b20f0bcc64671d8d758f3469ec5ce4c8484a875',
    index: 4,
    tokens: {[FIRST_ERC20_TOKEN_ADDRESS]: new BigNumber(600)},
    balance: asWei(5e11),
  },
  {
    address: '0x3b20f0bcc64671d8d758f3469ec5ce4c8484a876',
    index: 3,
    tokens: {[FIRST_ERC20_TOKEN_ADDRESS]: new BigNumber(1234)},
    balance: asEther(5.5),
  },
  {
    address: '0x3b20f0bcc64671d8d758f3469ec5ce4c8484a877',
    index: 2,
    tokens: {},
    balance: asWei(0),
  },
  {
    address: '0x3b20f0bcc64671d8d758f3469ec5ce4c8484a878',
    index: 1,
    tokens: {},
    balance: asWei(0),
  },
  {
    address: '0x3b20f0bcc64671d8d758f3469ec5ce4c8484a879',
    index: 0,
    tokens: {},
    balance: asWei(0),
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
    address: '0x0000111122223333444455556666777788889999',
  },
]
