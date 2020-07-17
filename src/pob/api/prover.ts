import * as t from 'io-ts'
import * as tPromise from 'io-ts-promise'
import {pipe} from 'fp-ts/lib/pipeable'
import {fold} from 'fp-ts/lib/Either'
import {ExtendableError} from '../../common/extendable-error'
import {ProverConfig} from '../../config/type'
import {BurnWatcher} from '../pob-state'
import {ChainId} from '../chains'
import {wait} from '../../shared/utils'
import {PROVER_API_REQUEST_TIMEOUT} from '../pob-config'
import {rendererLog} from '../../common/logger'
import {DateFromISO8601} from '../../common/io-helpers'

function notRequired<T extends t.Mixed>(type: T): t.UnionC<[T, t.NullC, t.UndefinedC]> {
  return t.union([type, t.null, t.undefined])
}

const GenericError = t.type({
  error: t.type({
    message: t.string,
    code: t.number,
  }),
})

export const NO_BURN_OBSERVED = 'No burn transactions found since observation start.'

const NoBurnStatus = t.type({
  status: t.literal(NO_BURN_OBSERVED),
})

const BurnStatusType = t.keyof({
  tx_found: null,
  commitment_submitted: null,
  commitment_appeared: null,
  redeem_submitted: null,
  redeem_appeared: null,
  redeem_another_prover: null,
  proof_fail: null,
  commitment_fail: null,
  redeem_fail: null,
})

const chainType = t.keyof({
  BTC_MAINNET: null,
  BTC_TESTNET: null,
  ETH_MAINNET: null,
  ETH_TESTNET: null,
})

const Timestamps = t.type({
  tx_found: notRequired(DateFromISO8601),
  commitment_submitted: notRequired(DateFromISO8601),
  redeem_submitted: notRequired(DateFromISO8601),
})

const BurnApiStatus = t.type({
  txid: t.string,
  tx_value: t.union([t.number, t.null]),
  status: BurnStatusType,
  burn_tx_height: t.union([t.number, t.null]),
  current_source_height: t.number,
  processing_start_height: t.union([t.number, t.null]),
  commitment_txid: t.union([t.string, t.null]),
  redeem_txid: t.union([t.string, t.null]),
  fail_reason: notRequired(t.string),
  chain: notRequired(chainType),
  last_tag_height: notRequired(t.number),
  timestamps: notRequired(Timestamps),
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
  chain_id: t.number,
  min_fee: t.number,
})

const ProverInfo = t.type({
  chains: t.record(t.string, ChainInfo),
})

export type ChainInfo = t.TypeOf<typeof ChainInfo>

type RequestMode = 'observer' | 'submitter'

export const REQUEST_MODE_PORT: Record<RequestMode, number> = {
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
  rendererLog.error(error)

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
): Promise<unknown> => {
  const timeoutController = new AbortController()
  wait(PROVER_API_REQUEST_TIMEOUT).then(() => timeoutController.abort())
  const url = `${proverConfig.address}:${REQUEST_MODE_PORT[mode]}${path}`
  const res = await fetch(url, {
    ...config,
    signal: timeoutController.signal,
  }).catch((e: Error) => {
    if (e.name === 'AbortError') {
      throw new ProverApiError('Request to prover timed out.', {})
    }
    throw e
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
    throw new ProverApiError(
      `Couldn't process request, the prover responded with: ${errorMessage}`,
      response,
      errorCode,
    )
  }

  return res.json()
}

const httpPostRequest = async (
  prover: ProverConfig,
  mode: RequestMode,
  path: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any,
): Promise<unknown> =>
  httpRequest(prover, mode, path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

const httpGetRequest = async (
  prover: ProverConfig,
  mode: RequestMode,
  path: string,
): Promise<unknown> => httpRequest(prover, mode, path, {method: 'GET'})

export const getStatuses = async ({burnAddress, prover}: BurnWatcher): Promise<AllApiStatus[]> => {
  return httpPostRequest(prover, 'submitter', '/api/v1/status', {
    burn_address: burnAddress,
  }).then(tPromise.decode(BurnApiStatuses))
}

export const createBurn = async (
  prover: ProverConfig,
  address: string,
  chainId: ChainId,
  fee: number,
  autoConversion: boolean,
): Promise<string> => {
  return httpPostRequest(prover, 'observer', '/api/v1/observe', {
    midnight_address: address,
    chain: chainId,
    fee,
    auto_exchange: autoConversion,
  })
    .then(tPromise.decode(BurnType))
    .then((burnType) => burnType.burn_address)
}

export const proveTransaction = async (
  prover: ProverConfig,
  txid: string,
  burnAddress: string,
): Promise<void> => {
  await httpPostRequest(prover, 'observer', '/api/v1/prove', {
    txid,
    burn_address: burnAddress,
  })
}

export const getInfo = async (
  prover: ProverConfig,
): Promise<Partial<Record<ChainId, ChainInfo>>> => {
  return httpGetRequest(prover, 'submitter', '/api/v1/info')
    .then(tPromise.decode(ProverInfo))
    .then(({chains}) => chains)
}
