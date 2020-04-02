import * as t from 'io-ts'
import * as tPromise from 'io-ts-promise'
import _ from 'lodash'
import {pipe} from 'fp-ts/lib/pipeable'
import {fold} from 'fp-ts/lib/Either'
import {ExtendableError} from '../../common/extendable-error'
import {ProverConfig} from '../../config/type'
import {BurnWatcher, BurnAddressInfo} from '../pob-state'
import {ChainId} from '../chains'

const GenericError = t.type({
  error: t.type({
    message: t.string,
    code: t.number,
  }),
})

export const NO_BURN_OBSERVED = 'No burn transactions observed since observation start.'

const NoBurnStatus = t.type({
  status: t.literal(NO_BURN_OBSERVED),
})

const BurnStatusType = t.keyof({
  BURN_OBSERVED: null,
  PROOF_READY: null,
  PROOF_FAIL: null,
  TX_VALUE_TOO_LOW: null,
  COMMITMENT_APPEARED: null,
  COMMITMENT_CONFIRMED: null,
  COMMITMENT_FAIL: null,
  REVEAL_APPEARED: null,
  REVEAL_CONFIRMED: null,
  REVEAL_FAIL: null,
  REVEAL_DONE_ANOTHER_PROVER: null,
})

const chainType = t.keyof({
  BTC_MAINNET: null,
  BTC_TESTNET: null,
  ETH_MAINNET: null,
  ETH_TESTNET: null,
})

const BurnApiStatus = t.type({
  status: BurnStatusType,
  txid: t.string,
  chain: chainType,
  midnight_txid: t.union([t.string, t.null]),
  burn_tx_height: t.union([t.number, t.null]),
  current_source_height: t.number,
  processing_start_height: t.union([t.number, t.null]),
  last_tag_height: t.number,
  tx_value: t.union([t.number, t.null, t.undefined]),
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

const ChainInfo = t.type({
  source_chain: chainType,
  chain_id: t.number,
  last_block: t.number,
  last_tag_height: t.number,
  min_fee: t.number,
})

const ProverInfo = t.record(t.string, ChainInfo)

export type ChainInfo = t.TypeOf<typeof ChainInfo>

type RequestMode = 'observer' | 'submitter'

const REQUEST_MODE_PORT: Record<RequestMode, number> = {
  observer: 5000,
  submitter: 5047,
}

export class ProverApiError extends ExtendableError {
  response: unknown
  code?: number

  constructor(message: string, response: unknown, code?: number) {
    super(message)
    this.response = response // eslint-disable-line
    this.code = code // eslint-disable-line
  }
}

export const prettyErrorMessage = (
  error: Error,
  prettyApiError: (apiError: ProverApiError) => string = (e) => e.message,
): string => {
  console.error(error)

  if (tPromise.isDecodeError(error)) {
    return 'Unexpected response from prover.'
  }

  if (error instanceof ProverApiError) {
    return prettyApiError(error)
  }

  return 'Unexpected error while communicating with prover.'
}

const httpRequest = async (
  proverConfig: ProverConfig,
  mode: RequestMode,
  path: string,
  config: RequestInit = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: any,
): Promise<unknown> => {
  const url = `${proverConfig.address}:${REQUEST_MODE_PORT[mode]}${path}`
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    body: params && JSON.stringify(params),
    ...config,
  })

  if (!res.ok) {
    const response = await res.json()
    const {errorMessage, errorCode}: {errorMessage: string; errorCode?: number} = pipe(
      GenericError.decode(response),
      fold(
        () => ({
          errorMessage: 'Unknown error',
        }),
        (err) => ({
          errorMessage: err.error.message,
          errorCode: err.error.code,
        }),
      ),
    )
    throw new ProverApiError(`Couldn't process request: ${errorMessage}`, response, errorCode)
  }

  return res.json()
}

export const getStatuses = async ({burnAddress, prover}: BurnWatcher): Promise<AllApiStatus[]> => {
  return httpRequest(
    prover,
    'submitter',
    '/api/v1/status',
    {method: 'POST'},
    {
      burn_address: burnAddress,
    },
  ).then(tPromise.decode(BurnApiStatuses))
}

export const createBurn = async (
  prover: ProverConfig,
  address: string,
  chainId: ChainId,
  reward: number,
  autoConversion: boolean,
): Promise<string> => {
  return httpRequest(
    prover,
    'observer',
    '/api/v1/observe',
    {method: 'POST'},
    {
      auto_dust_conversion: autoConversion,
      chain_name: chainId,
      midnight_address: address,
      reward,
    },
  )
    .then(tPromise.decode(BurnType))
    .then((burnType) => burnType.burn_address)
}

export const proveTransaction = async (
  prover: ProverConfig,
  txid: string,
  burnAddress: BurnAddressInfo,
): Promise<void> => {
  await httpRequest(
    prover,
    'observer',
    '/api/v1/prove',
    {method: 'POST'},
    {
      txid,
      burn_params: {
        midnight_address: burnAddress.midnightAddress,
        reward: burnAddress.reward,
        auto_dust_conversion: burnAddress.autoConversion,
        chain_name: burnAddress.chainId,
      },
    },
  )
}

export const getInfo = async (prover: ProverConfig): Promise<ChainInfo[]> => {
  return httpRequest(prover, 'submitter', '/api/v1/info', {method: 'GET'})
    .then(tPromise.decode(ProverInfo))
    .then((p: Record<string, ChainInfo>) => _.values(p))
}
