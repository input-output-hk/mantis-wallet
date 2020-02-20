import {ProverConfig} from '../../config/type'
import {BurnWatcher} from '../pob-state'
import {Chain} from '../../common/chains'

export interface NoBurnObserved {
  status: 'No burn transactions observed.'
}

export interface BurnProgress {
  status:
    | 'BURN_OBSERVED'
    | 'PROOF_READY'
    | 'COMMITMENT_APPEARED'
    | 'COMMITMENT_CONFIRMED'
    | 'COMMITMENT_FAIL'
    | 'REVEAL_APPEARED'
    | 'REVEAL_CONFIRMED'
    | 'REVEAL_FAIL'
    | 'REVEAL_DONE_ANOTHER_PROVER'
  txid: string
  chain: string
  midnight_txid: string
  burn_tx_height: number
  current_source_height: number
  processing_start_height: number
  last_tag_height: number
}

export type BurnApiStatus = NoBurnObserved | BurnProgress

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
  const [apiStatus] = (await httpRequest(prover, 'prove', '/api/v1/status', {
    burn_address: burnAddress,
  })) as [BurnApiStatus]
  return apiStatus
}

export const createBurn = async (
  prover: ProverConfig,
  address: string,
  chain: Chain,
  reward: number,
  autoConversion: boolean,
): Promise<string> => {
  const response = (await httpRequest(prover, 'observe', '/api/v1/observe', {
    auto_dust_conversion: autoConversion,
    chain_name: chain.id,
    midnight_address: address,
    reward,
  })) as {
    burn_address: string
  }
  return response.burn_address
}
