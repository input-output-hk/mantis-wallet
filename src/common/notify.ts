import {rendererLog} from './logger'
import {SettingsState} from '../settings-state'

export const makeDesktopNotification = (
  body: string,
  title?: string,
  options: NotificationOptions = {},
): void => {
  const {
    language,
    translation: {t},
  } = SettingsState.useContainer()
  if (body.length > 256) {
    rendererLog.error('Notification body will be truncated on macOS (max 256 chars)')
    rendererLog.info({notificationBody: body})
  }

  if (document.hasFocus()) {
    return // Do not show notifications if the document has focus
  }

  const show = (): void => {
    new Notification(title || t(['title', 'lunaWallet']), {
      body,
      lang: language,
      ...options,
    })
  }

  if (Notification.permission === 'granted') {
    show()
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      // If the user accepts, let's create a notification
      if (permission === 'granted') {
        show()
      }
    })
  }
}
