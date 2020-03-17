import * as t from 'io-ts'
import * as tPromise from 'io-ts-promise'
import {ProverConfig} from '../../config/type'
import {BurnWatcher} from '../pob-state'
import {ChainId} from '../chains'

export const NO_BURN_OBSERVED = 'No burn transactions observed.'

const NoBurnStatus = t.type({
  status: t.literal(NO_BURN_OBSERVED),
})

const BurnStatusType = t.keyof({
  BURN_OBSERVED: null,
  PROOF_READY: null,
  PROOF_FAIL: null,
  COMMITMENT_APPEARED: null,
  COMMITMENT_CONFIRMED: null,
  COMMITMENT_FAIL: null,
  REVEAL_APPEARED: null,
  REVEAL_CONFIRMED: null,
  REVEAL_FAIL: null,
  REVEAL_DONE_ANOTHER_PROVER: null,
})

const BurnApiStatus = t.type({
  status: BurnStatusType,
  txid: t.string,
  chain: t.keyof({
    BTC_MAINNET: null,
    BTC_TESTNET: null,
    ETH_MAINNET: null,
    ETH_TESTNET: null,
  }),
  midnight_txid: t.union([t.string, t.null]),
  burn_tx_height: t.union([t.number, t.null]),
  current_source_height: t.number,
  processing_start_height: t.union([t.number, t.null]),
  last_tag_height: t.number,
})

const BurnApiStatuses = t.array(t.union([BurnApiStatus, NoBurnStatus]))

export type BurnStatusType = t.TypeOf<typeof BurnStatusType>

export type NoBurnStatus = t.TypeOf<typeof NoBurnStatus>
export type BurnApiStatus = t.TypeOf<typeof BurnApiStatus>

export type AllApiStatus = BurnApiStatus | NoBurnStatus

export const noBurnObservedFilter = (status: AllApiStatus): status is BurnApiStatus =>
  status.status !== NO_BURN_OBSERVED

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

export const getStatuses = async ({burnAddress, prover}: BurnWatcher): Promise<AllApiStatus[]> => {
  return httpRequest(prover, 'prove', '/api/v1/status', {
    burn_address: burnAddress,
  }).then(tPromise.decode(BurnApiStatuses))
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
