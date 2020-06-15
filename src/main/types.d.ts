type ProcessStatus = 'not-running' | 'running' | 'finished' | 'failed'

type NetworkTag = 'mainnet' | 'testnet'

interface LunaStatus {
  fetchParams: {
    status: ProcessStatus
  }
  wallet: {
    pid?: number
    status: ProcessStatus
  }
  node: {
    pid?: number
    status: ProcessStatus
  }
  dag: {
    status: ProcessStatus
    message?: string
  }
  info: {
    platform: string
    platformVersion: string
    cpu: string
    memory: number

    lunaVersion: string
    mainPid: number
    midnightVersion?: string
  }
}
