type ProcessStatus = 'notRunning' | 'running' | 'finished' | 'failed'

interface LunaStatus {
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
    mantisVersion?: string
    networkType?: string
  }
}
