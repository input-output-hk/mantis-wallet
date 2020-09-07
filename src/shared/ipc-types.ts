// FIXME: https://jira.iohk.io/browse/PM-2289 - Use discriminated union style msgs

export type IPCToRendererChannelName =
  | 'update-config-success'
  | 'update-config-failure'
  | 'save-debug-logs-success'
  | 'save-debug-logs-failure'
  | 'save-debug-logs-cancel'

export type IPCFromRendererChannelName =
  | 'update-network-tag'
  | 'save-debug-logs'
  | 'update-language'
