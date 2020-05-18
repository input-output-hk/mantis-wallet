// This file is an entry point to whole application, it simply doesn't make sense to keep it 100% pure
/* eslint-disable fp/no-let, fp/no-mutation */
import path from 'path'
import url from 'url'
import {exec, spawn} from 'child_process'
import {promisify} from 'util'
import {app, BrowserWindow, dialog, Menu, screen} from 'electron'
import {asapScheduler, scheduled} from 'rxjs'
import {pipe} from 'fp-ts/lib/pipeable'
import * as rxop from 'rxjs/operators'
import {mergeAll} from 'rxjs/operators'
import * as record from 'fp-ts/lib/Record'
import * as array from 'fp-ts/lib/Array'
import * as _ from 'lodash/fp'
import {option} from 'fp-ts'
import {LunaManagedConfigPaths} from '../shared/ipc-types'
import {ClientName, SettingsPerClient} from '../config/type'
import {MidnightProcess, processExecutablePath, SpawnedMidnightProcess} from './MidnightProcess'
import {
  configToParams,
  registerCertificateValidationHandler,
  setupExternalTLS,
  setupOwnTLS,
} from './tls'
import {flatTap, prop, wait} from '../shared/utils'
import {config, loadLunaManagedConfig} from '../config/main'
import {getCoinbaseParams, getMiningParams, updateConfig} from './dynamic-config'
import {buildMenu, buildRemixMenu} from './menu'
import {ipcListen} from './util'
import {status, setFetchParamsStatus, inspectLineForDAGStatus} from './status'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let mainWindowHandle: BrowserWindow | null = null

let remixWindowHandle: BrowserWindow | null = null

let shuttingDown = false

function createRemixWindow(): void {
  const {width, height} = screen.getPrimaryDisplay().workAreaSize

  const remixWindow = new BrowserWindow({
    width,
    height,
    icon: path.join(__dirname, '/../icon.png'),
  })

  const remixUrl = url.format({
    pathname: path.join(__dirname, '/../remix-ide/index.html'),
    protocol: 'file:',
    slashes: true,
  })

  remixWindow.setMenu(buildRemixMenu())
  remixWindow.loadURL(remixUrl)

  // Work-around for electron/chrome 51+ onbeforeunload behavior
  // which prevents the app window to close if not invalidated.
  remixWindow.webContents.on('dom-ready', () => {
    remixWindow.webContents.executeJavaScript('window.onbeforeunload = null')
  })

  remixWindow.on('closed', () => {
    remixWindowHandle = null
  })

  remixWindowHandle = remixWindow
}

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
    minWidth: 1140,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: true,
    },
  })

  const openRemix = (): void => {
    if (remixWindowHandle) {
      remixWindowHandle.focus()
    } else {
      createRemixWindow()
    }
  }

  Menu.setApplicationMenu(buildMenu(openRemix))

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

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    if (remixWindowHandle) {
      remixWindowHandle.close()
    }
    if (remixWindowHandle) {
      remixWindowHandle.destroy()
    }

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

//
// Configuration
//

const shared = {
  lunaConfig: () => config,
  lunaStatus: () => status,
  lunaManagedConfig: () => loadLunaManagedConfig(),
}

// Make configuration available for renderer process
app.on('remote-get-global', (event, webContents, name) => {
  if (name in shared) {
    event.preventDefault()
    // Electron extends DOM Event type, whose returnValue is typed to boolean
    // while electron encourages to return any value
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    event.returnValue = shared[name]()
  }
})

ipcListen('update-config', async (event, keyPath: LunaManagedConfigPaths, value: string) => {
  try {
    await updateConfig({[keyPath]: value})
    event.reply('update-config-success')
  } catch (e) {
    console.error(e)
    event.reply('update-config-failure', e.message)
  }
})

ipcListen('update-mining-config', async (event, spendingKey: string | null) => {
  if (!spendingKey) {
    console.info('Disabling mining')
    try {
      await updateConfig({miningEnabled: false})
    } catch (e) {
      return event.reply('disable-mining-failure', e.message)
    }
    event.reply('disable-mining-success')
    event.reply('update-config-success')
  } else {
    console.info(`Enabling mining with spending key: ${spendingKey}`)
    try {
      const coinbaseParams = await getCoinbaseParams(config.clientConfigs.wallet, spendingKey)
      await updateConfig({miningEnabled: true, ...coinbaseParams})
    } catch (e) {
      return event.reply('enable-mining-failure', e.message)
    }
    event.reply('enable-mining-success')
    event.reply('update-config-success')
  }
})

//Handle TLS from external config
if (!config.runClients) {
  pipe(
    config.tls,
    option.map(setupExternalTLS),
    option.fold(
      () => void 0,
      (tlsDataPromise) =>
        tlsDataPromise
          .then((tlsData) => registerCertificateValidationHandler(app, tlsData, config.rpcAddress))
          .catch((error) => {
            console.error(error)
            dialog.showErrorBox('Luna startup error', error.message)
            app.exit(1)
          }),
    ),
  )
}

//
// Handle client child processes with TLS
//
if (config.runClients) {
  const tlsDataPromise = setupOwnTLS(processExecutablePath(config.clientConfigs.node))
    .then((tlsData) => ({tlsData, tlsParams: configToParams(tlsData)}))
    .catch((error): never => {
      console.error(error)
      dialog.showErrorBox('Luna startup error', error.message)
      app.exit(1)
      // Little trick to make typechecker see that this promise cannot contain undefined
      // Because always an error is thrown
      throw new Error('exiting')
    })

  let runningClients: SpawnedMidnightProcess[] | null = null

  async function fetchParams(): Promise<void> {
    console.info('Fetching zkSNARK parameters')
    setFetchParamsStatus('running')
    const nodePath = processExecutablePath(config.clientConfigs.node)
    return promisify(exec)(`${nodePath} fetch-params`, {
      cwd: config.clientConfigs.node.packageDirectory,
    })
      .then(({stdout, stderr}) => {
        setFetchParamsStatus('finished')
        console.info(stdout)
        console.error(stderr)
      })
      .catch((error) => {
        setFetchParamsStatus('failed')
        console.error(error)
        dialog.showErrorBox('Luna startup error', 'Failed to fetch zkSNARK parameters')
        app.exit(1)
        return Promise.reject(error)
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
        return client.log$.pipe(
          rxop.tap(inspectLineForDAGStatus),
          rxop.map((line) => `${prefix}${line}`),
        )
      }),
      (logs) => scheduled(logs, asapScheduler),
      mergeAll(),
    ).subscribe(console.info)
  }

  function spawnClients(additionalSettings: SettingsPerClient): void {
    const clients = pipe(
      config.clientConfigs,
      record.toArray,
      array.map(([name, processConfig]) =>
        MidnightProcess(spawn)(name, config.dataDir, processConfig),
      ),
      array.map((spawner) => spawner.spawn(additionalSettings[spawner.name])),
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

  const startClients = (): Promise<void> =>
    Promise.all([getMiningParams(), tlsDataPromise.then(prop('tlsParams'))])
      .then(_.mergeAll)
      .then(spawnClients)
      .catch((error) => {
        console.error(error)
        return Promise.reject(error)
      })

  async function restartClients(): Promise<void> {
    if (!shuttingDown) {
      console.info('restarting clients')
      return killClients()
        .then(() => wait(500))
        .then(startClients)
    }
  }

  function killAndQuit(event: Event): void {
    shuttingDown = true
    if (runningClients) {
      event.preventDefault()
      killClients().then(() => app.quit())
    }
  }

  tlsDataPromise.then(flatTap(() => fetchParams())).then(startClients)
  tlsDataPromise.then(({tlsData}) => {
    registerCertificateValidationHandler(app, tlsData, config.rpcAddress)
  })

  app.on('before-quit', killAndQuit)
  app.on('will-quit', killAndQuit)
  app.on('window-all-closed', killAndQuit)

  ipcListen('restart-clients', async (event) => {
    try {
      await killClients()
    } catch (e) {
      console.error(e)
      event.reply('restart-clients-failure', e.message)
    }
  })
}
