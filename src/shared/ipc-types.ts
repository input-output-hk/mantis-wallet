export type IPCToRendererChannelName =
  | 'update-config-success'
  | 'update-config-failure'
  | 'enable-mining-success'
  | 'enable-mining-failure'
  | 'disable-mining-success'
  | 'disable-mining-failure'
  | 'restart-clients-failure'

export type IPCFromRendererChannelName =
  | 'restart-clients'
  | 'update-config'
  | 'update-mining-config'
  | 'update-network-tag'

export type LunaManagedConfigPaths = 'selectedNetwork'
