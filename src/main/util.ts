// Typed wrapper for listening to IPC events
import {ipcMain} from 'electron'
import {IPCFromRendererChannelName} from '../shared/ipc-types'
import {LUNA_VERSION, TESTNET_EDITION} from '../shared/version'

export function ipcListen(
  channel: IPCFromRendererChannelName,
  listener: Parameters<typeof ipcMain.on>[1],
): void {
  ipcMain.on(channel, listener)
}

export function getTitle(networkTag?: NetworkTag): string {
  const edition = networkTag === 'testnet' ? ` — ${TESTNET_EDITION.toLowerCase()}` : ''
  return `Luna Wallet — ${LUNA_VERSION}${edition}`
}
