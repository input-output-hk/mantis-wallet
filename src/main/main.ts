// This file is an entry point to whole application, it simply doesn't make sense to keep it 100% pure
/* eslint-disable fp/no-let, fp/no-mutation */
import path from 'path'
import url from 'url'
import {spawn, exec} from 'child_process'
import {promisify} from 'util'
import {app, BrowserWindow, dialog, globalShortcut, screen} from 'electron'
import {asapScheduler, scheduled} from 'rxjs'
import {pipe} from 'fp-ts/lib/pipeable'
import * as rxop from 'rxjs/operators'
import {mergeAll} from 'rxjs/operators'
import * as record from 'fp-ts/lib/Record'
import * as array from 'fp-ts/lib/Array'
import * as _ from 'lodash/fp'
import {config} from '../config/main'
import {ClientName} from '../config/type'
import {MidnightProcess, SpawnedMidnightProcess} from './MidnightProcess'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let mainWindowHandle: BrowserWindow | null = null

function createWindow(): void {
  // Debug logs
  const toLog = {
    versions: process.versions,
    config,
  }
  console.dir(toLog, {depth: 4})

  // Create the browser window.
  const {width, height} = screen.getPrimaryDisplay().workAreaSize
  const mainWindow = new BrowserWindow({
    width,
    height,
    icon: path.join(__dirname, '/../icon.png'),
    webPreferences: {
      nodeIntegration: true,
    },
  })

  const startUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, '/../index.html'),
      protocol: 'file:',
      slashes: true,
    })
  mainWindow.loadURL(startUrl)

  if (config.openDevTools) {
    // Open the DevTools.
    mainWindow.webContents.openDevTools()
  }

  // Register Ctrl+D to open DevTools
  globalShortcut.register('CommandOrControl+D', () => {
    mainWindow.webContents.openDevTools()
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindowHandle = null
  })

  mainWindowHandle = mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Make configuration available for renderer process
app.on('remote-get-global', (event, webContents, name) => {
  if (name === 'lunaConfig') {
    event.preventDefault()
    // Electron extends DOM Event type, whose returnValue is typed to boolean
    // while electron encourages to return any value
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    event.returnValue = config
  }
})

// Handle client child processes
if (config.runClients) {
  const spawners = pipe(
    config.clientConfigs,
    record.toArray,
    array.map(([name, processConfig]) =>
      MidnightProcess(spawn)(name, config.dataDir, processConfig),
    ),
  )

  let runningClients: SpawnedMidnightProcess[] | null = null

  async function fetchParams(): Promise<void> {
    console.log('Fetching zkSNARK parameters')
    const fetchParamsPath = path.resolve(config.distPackagesDir, 'fetch-params.sh')
    return promisify(exec)(fetchParamsPath)
      .then(({stdout, stderr}) => {
        console.log(stdout)
        console.error(stderr)
      })
      .catch((error) => {
        console.error(error)
        dialog.showErrorBox('Luna startup error', 'Failed to fetch zkSNARK parameters')
        app.exit(1)
      })
  }

  function logClients(clients: SpawnedMidnightProcess[]): void {
    const maxNameLength = pipe(
      clients,
      array.map((client) => client.name.length),
      _.max,
      (maybeValue) => maybeValue || 0,
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

    runningClients = clients
  }

  const killClients = async (): Promise<void> => {
    return runningClients
      ? Promise.all(runningClients.map((client) => client.kill())).then(() => {
          runningClients = null
        })
      : Promise.resolve()
  }

  async function restartClients(): Promise<void> {
    console.log('restarting clients')
    return killClients().then(spawnClients)
  }

  function killAndQuit(event: Event): void {
    if (runningClients) {
      event.preventDefault()
      killClients().then(() => app.quit())
    }
  }

  fetchParams().then(() => spawnClients())
  app.on('before-quit', killAndQuit)
  app.on('will-quit', killAndQuit)
  app.on('window-all-closed', killAndQuit)
}
