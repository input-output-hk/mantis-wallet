import * as t from 'io-ts'
import * as tPromise from 'io-ts-promise'
import {ProverConfig} from '../../config/type'
import {BurnWatcher} from '../pob-state'
import {ChainId} from '../chains'

const NoBurnObserved = t.type({
  status: t.literal('No burn transactions observed.'),
})

const BurnProgress = t.type({
  status: t.keyof({
    BURN_OBSERVED: null,
    PROOF_READY: null,
    COMMITMENT_APPEARED: null,
    COMMITMENT_CONFIRMED: null,
    COMMITMENT_FAIL: null,
    REVEAL_APPEARED: null,
    REVEAL_CONFIRMED: null,
    REVEAL_FAIL: null,
    REVEAL_DONE_ANOTHER_PROVER: null,
  }),
  txid: t.union([t.string, t.undefined]),
  chain: t.string,
  midnight_txid: t.union([t.string, t.undefined]),
  burn_tx_height: t.number,
  current_source_height: t.number,
  processing_start_height: t.number,
  last_tag_height: t.number,
})

const BurnApiStatuses = t.array(t.union([NoBurnObserved, BurnProgress]))

export type NoBurnObserved = t.TypeOf<typeof NoBurnObserved>

export type BurnProgress = t.TypeOf<typeof BurnProgress>

export type BurnApiStatus = NoBurnObserved | BurnProgress

const BurnType = t.type({
  burn_address: t.string,
})

type RequestMode = 'observe' | 'prove'

const REQUEST_MODE_PORT: Record<RequestMode, number> = {
  observe: 5000,
  prove: 5047,
}

const httpRequest = async (
  proverConfig: ProverConfig,
  mode: RequestMode,
  path: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any,
): Promise<unknown> => {
  const url = `${proverConfig.address}:${REQUEST_MODE_PORT[mode]}${path}`
  return (
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })
  ).json()
}

export const getStatus = async ({burnAddress, prover}: BurnWatcher): Promise<BurnApiStatus> => {
  return httpRequest(prover, 'prove', '/api/v1/status', {
    burn_address: burnAddress,
  })
    .then(tPromise.decode(BurnApiStatuses))
    .then(([apiStatus]) => apiStatus)
}

export const createBurn = async (
  prover: ProverConfig,
  address: string,
  chainId: ChainId,
  reward: number,
  autoConversion: boolean,
): Promise<string> => {
  return httpRequest(prover, 'observe', '/api/v1/observe', {
    auto_dust_conversion: autoConversion,
    chain_name: chainId,
    midnight_address: address,
    reward,
  })
    .then(tPromise.decode(BurnType))
    .then((burnType) => burnType.burn_address)
}
