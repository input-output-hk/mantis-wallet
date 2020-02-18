import {ProverConfig} from '../../config/type'
import {BurnWatcher} from '../pob-state'

export interface BurnApiStatus {
  status:
    | 'No burn transactions observed.'
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

const httpRequest = async (
  proverConfig: ProverConfig,
  path: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  const url = `${proverConfig.address}${path}`
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
  const [apiStatus] = await httpRequest(prover, '/api/v1/status', {
    burn_address: burnAddress,
  })
  return apiStatus as BurnApiStatus
}
