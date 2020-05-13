/* eslint-disable @typescript-eslint/no-explicit-any */
import {ipcRenderer} from 'electron'
import {
  IPCToRendererChannelName,
  IPCFromRendererChannelName,
  LunaManagedConfigPaths,
} from '../shared/ipc-types'
import {getContractAddresses} from '../config/renderer'

// General typed wrappers

export const ipcListen = (
  channel: IPCToRendererChannelName,
  listener: Parameters<typeof ipcRenderer.on>[1],
): void => {
  ipcRenderer.on(channel, listener)
}

export const ipcRemoveAllListeners = (channel: IPCToRendererChannelName): void => {
  ipcRenderer.removeAllListeners(channel)
}

export const ipcSend = (channel: IPCFromRendererChannelName, ...args: any[]): void => {
  ipcRenderer.send(channel, ...args)
}

// Specific actions

export const restartClients = (): void => {
  ipcSend('restart-clients')
}

export const updateConfig = (configPath: LunaManagedConfigPaths, value: string | null): void => {
  ipcSend('update-config', configPath, value)
}

export const updateMiningConfig = (spendingKey: string | null): void => {
  ipcSend('update-mining-config', spendingKey)
}

export const updateSelectedNetworkConfig = (selectedNetwork: string): void => {
  const contractAddresses = getContractAddresses()
  if (!(selectedNetwork in contractAddresses)) {
    return console.error(
      `Invalid network: "${selectedNetwork}". Valid networks: ${Object.keys(contractAddresses)}`,
    )
  }
  updateConfig('selectedNetwork', selectedNetwork)
}
