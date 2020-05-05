const DEFAULT_OPTIONS: NotificationOptions = {
  lang: 'en-US',
}

export const makeDesktopNotification = (
  body: string,
  title = 'Luna Wallet',
  options: NotificationOptions = {},
): void => {
  if (body.length > 256) {
    console.error('Notification body will be truncated on macOS (max 256 chars)')
    console.info({notificationBody: body})
  }

  if (document.hasFocus()) {
    return // Do not show notifications if the document has focus
  }

  const show = (): void => {
    new Notification(title, {
      body,
      ...DEFAULT_OPTIONS,
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
