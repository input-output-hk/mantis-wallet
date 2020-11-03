type ProcessStatus = 'notRunning' | 'running' | 'finished' | 'failed'

interface MantisWalletStatus {
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

    mantisWalletVersion: string
    mainPid: number
    mantisVersion?: string
  }
}
