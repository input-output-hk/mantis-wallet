import chai, {assert} from 'chai'
import chaiAsPromised from 'chai-as-promised'
import fetchMock, {enableFetchMocks} from 'jest-fetch-mock'
import {ProverConfig} from '../../config/type'
import {getStatuses, REQUEST_MODE_PORT, createBurn, proveTransaction, getInfo} from './prover'
import {wait} from '../../shared/utils'

jest.mock('../pob-config', () => {
  const pobConfig = jest.requireActual('../pob-config')
  return {
    ...pobConfig,
    PROVER_API_REQUEST_TIMEOUT: 100,
  }
})

chai.use(chaiAsPromised)

enableFetchMocks()

beforeEach(() => {
  fetchMock.mockClear()
})

const dummyProver: ProverConfig = {
  name: 'Dummy Prover',
  address: 'http://dummy-prover.com',
}

const testBurnAddress = '0xab415d89ffF3f5fbBE48deDA3a6ce2079A35acde'
const testTx = 'test-transaction'

const testMidnightAddress = 'm-test-uns-ad1rjfgdj6fewrhlv6j5qxeck38ms2t5szhrmg6v7'
const testChainId = 'ETH_TESTNET'
const testFee = 123000000
const testAutoExchange = false

it('creates correct request for getting the status', async () => {
  fetchMock.mockResponse(
    (): Promise<string> =>
      Promise.resolve(
        JSON.stringify([
          {
            burn_tx_height: 8016033,
            chain: 'ETH_TESTNET',
            commitment_txid: '0x96da0cdd2819627f650bc7a6a4df0b413fc27d12452bf0c1cbc54f0e4b3400b0',
            current_source_height: 8051085,
            fail_reason: '',
            last_tag_height: 8046190,
            processing_start_height: 8016280,
            redeem_txid: '0x10305d0ed487a1f2017dd6db1d13cc29275eac5b37bf6a739e8ee8c055beb37d',
            status: 'redeem_appeared',
            tx_value: 11100000000000000,
            txid: '0x2535955b59a90e2bf51e066347537c8c81de8540267691dfb87e52d72d244a90',
          },
        ]),
      ),
  )
  await getStatuses({burnAddress: testBurnAddress, prover: dummyProver})

  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(fetchMock).toHaveBeenCalledWith(
    `${dummyProver.address}:${REQUEST_MODE_PORT['submitter']}/api/v1/status`,
    {
      body: JSON.stringify({burn_address: testBurnAddress}),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      signal: new AbortController().signal,
    },
  )
})

it('creates correct request for creating a burn address', async () => {
  fetchMock.mockResponse(
    (): Promise<string> =>
      Promise.resolve(
        JSON.stringify({
          burn_address: '0xb0434DD0eb1Dd3bb477144FD65bD30391D86276e',
          observe_start_height: 8051129,
        }),
      ),
  )
  await createBurn(dummyProver, testMidnightAddress, testChainId, testFee, testAutoExchange)

  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(fetchMock).toHaveBeenCalledWith(
    `${dummyProver.address}:${REQUEST_MODE_PORT['observer']}/api/v1/observe`,
    {
      body: JSON.stringify({
        midnight_address: testMidnightAddress,
        chain: testChainId,
        fee: testFee,
        auto_exchange: testAutoExchange,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      signal: new AbortController().signal,
    },
  )
})

it('creates correct request for proving a transaction', async () => {
  fetchMock.mockResponse((): Promise<string> => Promise.resolve(JSON.stringify({status: 'ok'})))
  await proveTransaction(dummyProver, testTx, testBurnAddress)

  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(fetchMock).toHaveBeenCalledWith(
    `${dummyProver.address}:${REQUEST_MODE_PORT['observer']}/api/v1/prove`,
    {
      body: JSON.stringify({
        txid: testTx,
        burn_address: testBurnAddress,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      signal: new AbortController().signal,
    },
  )
})

it('creates correct request for getting prover info', async () => {
  fetchMock.mockResponse(
    (): Promise<string> =>
      Promise.resolve(
        JSON.stringify({
          chains: {
            BTC_TESTNET: {
              chain_id: 1,
              last_block: 1764054,
              last_tag_height: null,
              min_fee: 10,
            },
            ETH_TESTNET: {
              chain_id: 3,
              last_block: 8051117,
              last_tag_height: 7662670,
              min_fee: 15,
            },
          },
          pow: {
            enforce: false,
            target: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          },
        }),
      ),
  )
  await getInfo(dummyProver)

  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(fetchMock).toHaveBeenCalledWith(
    `${dummyProver.address}:${REQUEST_MODE_PORT['submitter']}/api/v1/info`,
    {
      method: 'GET',
      signal: new AbortController().signal,
    },
  )
})

it('respects timeout if there is no timely response', async () => {
  fetchMock.mockResponse(
    (): Promise<string> =>
      wait(300).then(() =>
        JSON.stringify({
          burn_address: '0xb0434DD0eb1Dd3bb477144FD65bD30391D86276e',
          observe_start_height: 8051129,
        }),
      ),
  )

  await assert.isRejected(
    createBurn(dummyProver, testMidnightAddress, testChainId, testFee, testAutoExchange),
    'Request to prover timed out.',
    'Should throw timeout error',
  )
})
