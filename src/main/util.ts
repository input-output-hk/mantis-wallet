// Typed wrapper for listening to IPC events
import {app, ipcMain, dialog} from 'electron'
import {IPCFromRendererChannelName} from '../shared/ipc-types'
import {MANTIS_WALLET_VERSION} from '../shared/version'
import {TFunctionMain} from './i18n'
import {displayNameOfNetwork} from '../config/type'

export function ipcListenToRenderer(
  channel: IPCFromRendererChannelName,
  listener: Parameters<typeof ipcMain.on>[1],
): void {
  ipcMain.on(channel, listener)
}

export function getTitle(t: TFunctionMain, networkType?: string): string {
  const displayedNetworkType =
    !!networkType && networkType !== 'main' ? ` — ${displayNameOfNetwork(networkType)}` : ''
  return `${t(['title', 'mantisWallet'])} — ${MANTIS_WALLET_VERSION}${displayedNetworkType}`
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
