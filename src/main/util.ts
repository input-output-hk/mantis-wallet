// Typed wrapper for listening to IPC events
import {app, ipcMain, dialog} from 'electron'
import {IPCFromRendererChannelName} from '../shared/ipc-types'
import {LUNA_VERSION} from '../shared/version'
import {TFunctionMain} from './i18n'

export function ipcListenToRenderer(
  channel: IPCFromRendererChannelName,
  listener: Parameters<typeof ipcMain.on>[1],
): void {
  ipcMain.on(channel, listener)
}

export function getTitle(t: TFunctionMain, networkType?: string): string {
  const displayedNetworkType = networkType !== 'main' ? ` — ${networkType}` : ''
  return `${t(['title', 'lunaWallet'])} — ${LUNA_VERSION}${displayedNetworkType}`
}

export function showErrorBox(t: TFunctionMain, title: string, content: string): void {
  if (app.isReady()) {
    dialog.showMessageBoxSync({
      type: 'error',
      buttons: [t(['dialog', 'button', 'ok'])],
      title: t(['dialog', 'title', 'error']),
      message: title,
      detail: content,
    })
  } else {
    dialog.showErrorBox(title, content)
  }
}
