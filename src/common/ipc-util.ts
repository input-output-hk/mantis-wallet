/* eslint-disable @typescript-eslint/no-explicit-any */
import {ipcRenderer} from 'electron'
import {IPCToRendererChannelName, IPCFromRendererChannelName} from '../shared/ipc-types'

// General typed wrappers

export const ipcListenToMain = (
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

export const updateMiningConfig = (spendingKey: string | null): void => {
  ipcSend('update-mining-config', spendingKey)
}

export const updateNetworkTag = (networkTag: NetworkTag): void => {
  ipcSend('update-network-tag', networkTag)
}

export const saveDebugLogs = (): void => {
  ipcSend('save-debug-logs')
}
