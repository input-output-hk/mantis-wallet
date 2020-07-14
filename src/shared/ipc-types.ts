// FIXME: https://jira.iohk.io/browse/PM-2289 - Use discriminated union style msgs

export type IPCToRendererChannelName =
  | 'update-config-success'
  | 'update-config-failure'
  | 'enable-mining-success'
  | 'enable-mining-failure'
  | 'disable-mining-success'
  | 'disable-mining-failure'
  | 'restart-clients-failure'
  | 'restart-clients-success'
  | 'save-debug-logs-success'
  | 'save-debug-logs-failure'
  | 'save-debug-logs-cancel'

export type IPCFromRendererChannelName =
  | 'restart-clients'
  | 'update-mining-config'
  | 'update-network-tag'
  | 'save-debug-logs'
