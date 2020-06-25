export type IPCToRendererChannelName =
  | 'update-config-success'
  | 'update-config-failure'
  | 'enable-mining-success'
  | 'enable-mining-failure'
  | 'disable-mining-success'
  | 'disable-mining-failure'
  | 'restart-clients-failure'
  | 'save-debug-logs-success'
  | 'save-debug-logs-failure'
  | 'save-debug-logs-cancel'

export type IPCFromRendererChannelName =
  | 'restart-clients'
  | 'update-config'
  | 'update-mining-config'
  | 'update-network-tag'
  | 'save-debug-logs'

export type LunaManagedConfigPaths = 'selectedNetwork'
