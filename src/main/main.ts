/* eslint-disable fp/no-let, fp/no-mutation */
import * as option from 'fp-ts/lib/Option'
import {Option} from 'fp-ts/lib/Option'
import {app, BrowserWindow} from 'electron'
import path from 'path'
import url from 'url'
import {spawn} from 'child_process'
import {asapScheduler, merge, scheduled} from 'rxjs'
import {pipe} from 'fp-ts/lib/pipeable'
import * as rxop from 'rxjs/operators'
import * as record from 'fp-ts/lib/Record'
import * as array from 'fp-ts/lib/Array'
import * as _ from 'lodash/fp'

import {ClientName, config} from './config'
import {MidnightProcess, SpawnedMidnightProcess} from './MidnightProcess'
import {scheduleArray} from 'rxjs/internal/scheduled/scheduleArray'
import {mergeAll} from 'rxjs/operators'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindowHandle: Option<BrowserWindow>

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
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
    mainWindowHandle = option.none
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
  if (option.isNone(mainWindowHandle)) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
console.log('config', JSON.stringify(config, null, 4))

if (config.runClients) {
  const spawners = pipe(
    config.clientConfigs,
    record.toArray,
    array.map(([name, config]) => MidnightProcess(spawn)(name, config)),
  )

  let runningClients: Option<SpawnedMidnightProcess[]> = option.none

  function logClients(clients: SpawnedMidnightProcess[]): void {
    const maxNameLength = pipe(
      clients,
      array.map((client) => client.name.length),
      _.max,
      option.fromNullable,
      option.getOrElse(() => 0),
    )
    const buildPrefix = (name: ClientName): string => `${name.padEnd(maxNameLength)} | `

    pipe(
      clients,
      array.map((client) => {
        const prefix = buildPrefix(client.name)
        return client.log$.pipe(rxop.map((line) => `${prefix}${line}`))
      }),
      (logs) => scheduled(logs, asapScheduler),
      mergeAll(),
    ).subscribe(console.log)
  }

  function spawnClients(): void {
    const clients = pipe(
      spawners,
      array.map((spawner) => spawner.spawn()),
    )

    logClients(Object.values(clients))

    pipe(
      clients,
      array.map((client) => client.close$),
      (closeEvents) => scheduled(closeEvents, asapScheduler),
      mergeAll(),
      rxop.take(1),
    ).subscribe(() => restartClients())

    runningClients = option.some(clients)
  }

  const killClients = async (): Promise<void> =>
    pipe(
      runningClients,
      option.fold(Promise.resolve, (clients) =>
        Promise.all(clients.map((client) => client.kill())).then(() => {
          runningClients = option.none
        }),
      ),
    )

  async function restartClients(): Promise<void> {
    console.log('restarting clients')
    return killClients().then(spawnClients)
  }

  spawnClients()
  app.on('before-quit', killClients)
}
