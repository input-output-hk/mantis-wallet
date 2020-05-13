// Typed wrapper for listening to IPC events
import {ipcMain} from 'electron'
import {IPCFromRendererChannelName} from '../shared/ipc-types'

export function ipcListen(
  channel: IPCFromRendererChannelName,
  listener: Parameters<typeof ipcMain.on>[1],
): void {
  ipcMain.on(channel, listener)
}
