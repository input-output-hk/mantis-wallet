// Typed wrapper for listening to IPC events
import {promises as fs} from 'fs'
import {app, ipcMain, dialog} from 'electron'
import {IPCFromRendererChannelName, IPCToRendererChannelName} from '../shared/ipc-types'
import {EDITION, MANTIS_WALLET_VERSION} from '../shared/version'
import {TFunctionMain} from './i18n'
import {displayNameOfNetworkMain} from '../config/type'

export function ipcListenToRenderer(
  channel: IPCFromRendererChannelName,
  listener: Parameters<typeof ipcMain.on>[1],
): void {
  ipcMain.on(channel, listener)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function emitToRenderer(channel: IPCToRendererChannelName, ...args: any[]): void {
  ipcMain.emit(channel, ...args)
}

export function getTitle(t: TFunctionMain, networkType?: string): string {
  const networkName = displayNameOfNetworkMain(networkType || '', t)
  return `${t(['title', 'mantisWallet'])} — ${MANTIS_WALLET_VERSION} ${EDITION} — ${networkName}`
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

export const isDirEmpty = (dir: string): Promise<boolean> =>
  fs.readdir(dir).then((files) => files.length === 0)
