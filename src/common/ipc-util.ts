/* eslint-disable @typescript-eslint/no-explicit-any */
import {ipcRenderer} from 'electron'
import {IPCToRendererChannelName, IPCFromRendererChannelName} from '../shared/ipc-types'
import {Language} from '../shared/i18n'

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

export const updateLanguage = (language: Language): void => {
  ipcSend('update-language', language)
}

export const saveDebugLogs = (): void => {
  ipcSend('save-debug-logs')
}
