// Typed wrapper for listening to IPC events
import {ipcMain, dialog} from 'electron'
import {IPCFromRendererChannelName} from '../shared/ipc-types'
import {LUNA_VERSION} from '../shared/version'
import {TFunctionMain} from './i18n'

export function ipcListenToRenderer(
  channel: IPCFromRendererChannelName,
  listener: Parameters<typeof ipcMain.on>[1],
): void {
  ipcMain.on(channel, listener)
}

export function getTitle(t: TFunctionMain, networkTag?: NetworkTag): string {
  const edition = networkTag === 'testnet' ? ` — ${t(['title', 'testnetEdition'])}` : ''
  return `${t(['title', 'lunaWallet'])} — ${LUNA_VERSION}${edition}`
}

export function showErrorBox(t: TFunctionMain, title: string, content: string): void {
  dialog.showMessageBoxSync({
    type: 'error',
    buttons: [t(['dialog', 'button', 'ok'])],
    title: t(['dialog', 'title', 'error']),
    message: title,
    detail: content,
  })
}
