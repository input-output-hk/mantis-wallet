export const makeDesktopNotification = (body: string, title = 'Luna Wallet'): void => {
  if (body.length > 256) {
    console.error('Notification body will be truncated on macOS (max 256 chars)')
  }
  console.info({notification: {title, body}})

  const show = (): void => {
    new Notification(title, {
      body,
      lang: 'en-US',
    })
  }

  if (Notification.permission === 'granted') {
    show()
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(function(permission) {
      // If the user accepts, let's create a notification
      if (permission === 'granted') {
        show()
      }
    })
  }
}
