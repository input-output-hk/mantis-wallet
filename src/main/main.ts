/* eslint-disable fp/no-let, fp/no-mutation */
// Modules to control application life and create native browser window
import {fold, none, Option, some} from 'fp-ts/lib/Option'
import {app, BrowserWindow} from 'electron'
import path from 'path'
import url from 'url'
import {spawn} from 'child_process'
import {merge, Subscription} from 'rxjs'
import {pipe} from 'fp-ts/lib/pipeable'
import {take} from 'rxjs/operators'

import {config} from './config'
import {MidnightProcess, SpawnedMidnightProcess} from './MidnightProcess'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | null

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  })

  const startUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, '/../index.html'),
      protocol: 'file:',
      slashes: true,
    })
  mainWindow.loadURL(startUrl)

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function() {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

if (config.runClients) {
  const walletProcessSpawner = MidnightProcess(spawn)(config.wallet)
  const nodeProcessSpawner = MidnightProcess(spawn)(config.node)

  let runningClients: Option<{
    runningWallet: SpawnedMidnightProcess
    runningNode: SpawnedMidnightProcess
  }> = none

  function spawnClients(): void {
    const runningWallet = walletProcessSpawner.spawn()
    const runningNode = nodeProcessSpawner.spawn()

    runningWallet.log$.subscribe((log) => console.log('wallet | ', log))
    runningNode.log$.subscribe((log) => console.log('node   | ', log))

    merge(runningWallet.close$, runningNode.close$)
      .pipe(take(1))
      .subscribe(() => restartClients())

    runningClients = some({runningNode, runningWallet})
  }

  const killClients = async (): Promise<void> =>
    pipe(
      runningClients,
      fold(Promise.resolve, ({runningWallet, runningNode}) =>
        Promise.all([runningWallet.kill(), runningNode.kill()]).then(() => {
          runningClients = none
        }),
      ),
    )

  async function restartClients() {
    return killClients().then(spawnClients)
  }

  spawnClients()
  app.on('before-quit', killClients)
}
