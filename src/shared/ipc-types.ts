export type IPCToRendererChannelName =
  | 'update-config-success'
  | 'update-config-failure'
  | 'save-debug-logs-success'
  | 'save-debug-logs-failure'
  | 'save-debug-logs-cancel'
  | 'store-changed'

export type IPCFromRendererChannelName =
  | 'update-network-type'
  | 'save-debug-logs'
  | 'update-language'
  | 'update-network-name'
  | 'update-datadir-location'
