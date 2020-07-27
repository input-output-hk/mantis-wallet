// This file is an entry point to whole application, it simply doesn't make sense to keep it 100% pure
/* eslint-disable fp/no-let, fp/no-mutation */
import path from 'path'
import url from 'url'
import os from 'os'
import {exec, spawn} from 'child_process'
import {promisify} from 'util'
import * as _ from 'lodash/fp'
import {option} from 'fp-ts'
import * as array from 'fp-ts/lib/Array'
import * as record from 'fp-ts/lib/Record'
import {mergeAll} from 'rxjs/operators'
import * as rxop from 'rxjs/operators'
import {pipe} from 'fp-ts/lib/pipeable'
import {asapScheduler, scheduled} from 'rxjs'
import {app, BrowserWindow, dialog, Menu, screen} from 'electron'
import {ClientName, SettingsPerClient} from '../config/type'
import {
  MidnightProcess,
  processEnv,
  processExecutablePath,
  SpawnedMidnightProcess,
} from './MidnightProcess'
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
import {getTitle, ipcListenToRenderer, showErrorBox} from './util'
import {inspectLineForDAGStatus, setFetchParamsStatus, status, setNetworkTag} from './status'
import {checkDatadirCompatibility} from './compatibility-check'
import {saveLogsArchive} from './log-exporter'
import {mainLog} from './logger'
import {DEFAULT_LANGUAGE, Language} from '../shared/i18n'
import {
  createAndInitI18nForMain,
  createTFunctionMain,
  TFunctionMain,
  translateErrorMain,
} from './i18n'
import {store} from './store'

const IS_LINUX = os.type() == 'Linux'
const LINUX_ICON = path.join(__dirname, '/../icon.png')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindowHandle: BrowserWindow | null = null

let remixWindowHandle: BrowserWindow | null = null

let shuttingDown = false

const i18n = createAndInitI18nForMain(store.get('settings.language') || DEFAULT_LANGUAGE)
const t = createTFunctionMain(i18n)

function createRemixWindow(t: TFunctionMain): void {
  const {width, height} = screen.getPrimaryDisplay().workAreaSize

  const remixWindow = new BrowserWindow({
    icon: IS_LINUX ? LINUX_ICON : undefined,
    width,
    height,
  })

  const remixUrl = url.format({
    pathname: path.join(__dirname, '/../remix-ide/index.html'),
    protocol: 'file:',
    slashes: true,
  })

  remixWindow.setMenu(buildRemixMenu(t))
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

const openRemix = (t: TFunctionMain) => (): void => {
  if (remixWindowHandle) {
    remixWindowHandle.focus()
  } else {
    createRemixWindow(t)
  }
}

function createWindow(t: TFunctionMain): void {
  mainLog.info({
    versions: process.versions,
    config,
  })

  // Create the browser window.
  const {width, height} = screen.getPrimaryDisplay().workAreaSize
  const mainWindow = new BrowserWindow({
    title: getTitle(t),
    icon: IS_LINUX ? LINUX_ICON : undefined,
    width,
    height,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: true,
    },
    titleBarStyle: 'hidden',
  })

  Menu.setApplicationMenu(buildMenu(openRemix(t), t))

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
const openLuna = (t: TFunctionMain): Promise<void> => app.whenReady().then(() => createWindow(t))

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

ipcListenToRenderer('update-mining-config', async (event, spendingKey: string | null) => {
  if (!spendingKey) {
    mainLog.info('Disabling mining')
    try {
      await updateConfig({miningEnabled: false})
    } catch (e) {
      return event.reply('disable-mining-failure', e.message)
    }
    event.reply('disable-mining-success')
    event.reply('update-config-success')
  } else {
    mainLog.info(`Enabling mining with spending key: ${spendingKey}`)
    try {
      const coinbaseParams = await getCoinbaseParams(config.clientConfigs.wallet, spendingKey)
      await updateConfig({miningEnabled: true, ...coinbaseParams})
    } catch (e) {
      return event.reply('enable-mining-failure', translateErrorMain(t, e))
    }
    event.reply('enable-mining-success')
    event.reply('update-config-success')
  }
})

ipcListenToRenderer('update-network-tag', (_event, networkTag: NetworkTag) => {
  setNetworkTag(networkTag)
  mainWindowHandle?.setTitle(getTitle(t, networkTag))
})

ipcListenToRenderer('save-debug-logs', async (event) => {
  const options = {
    title: t(['dialog', 'title', 'saveDebugLogs']),
    buttonLabel: t(['dialog', 'button', 'saveDebugLogs']),
    defaultPath: `luna-debug-logs-${Date.now()}.zip`,
    filters: [{name: t(['dialog', 'fileFilter', 'zipArchives']), extensions: ['zip']}],
  }

  const {canceled, filePath} = await dialog.showSaveDialog(options)
  if (canceled || !filePath) {
    return event.reply('save-debug-logs-cancel')
  }

  try {
    saveLogsArchive(filePath)
    event.reply('save-debug-logs-success', filePath)
  } catch (e) {
    mainLog.error(e)
    event.reply('save-debug-logs-failure', e.message)
  }
})

// Setup language handling
ipcListenToRenderer('update-language', (_event, language: Language) => {
  if (mainWindowHandle) {
    i18n.changeLanguage(language).then(() => {
      const t = createTFunctionMain(i18n)
      Menu.setApplicationMenu(buildMenu(openRemix(t), t))
      mainWindowHandle?.setTitle(getTitle(t, status.info.networkTag))
      if (remixWindowHandle) {
        remixWindowHandle.setMenu(buildRemixMenu(t))
      }
    })
  }
})

// Handle TLS from external config
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
            mainLog.error(error)
            showErrorBox(t, t(['dialog', 'title', 'startupError']), error.message)
            app.exit(1)
          }),
    ),
  )
}

//
// Handle client child processes with TLS
//
if (config.runClients) {
  const initializationPromise = checkDatadirCompatibility(t)
    .then(() => openLuna(t))
    .then(() => setupOwnTLS(config.clientConfigs.node))
    .then((tlsData) => ({
      tlsData,
      tlsParams: configToParams(tlsData),
    }))
    .catch(
      async (e): Promise<never> => {
        mainLog.error(e)
        showErrorBox(t, t(['dialog', 'title', 'startupError']), translateErrorMain(t, e))
        app.exit(1)
        // Little trick to make typechecker see that this promise cannot contain undefined
        // Because always an error is thrown
        throw Error('exiting')
      },
    )

  let runningClients: SpawnedMidnightProcess[] | null = null

  async function fetchParams(): Promise<void> {
    mainLog.info('Fetching Sonics parameters')
    setFetchParamsStatus('running')
    const nodePath = processExecutablePath(config.clientConfigs.node)
    return promisify(exec)(`${nodePath} fetch-params`, {
      cwd: config.clientConfigs.node.packageDirectory,
      env: processEnv(config.clientConfigs.node),
    })
      .then(({stdout, stderr}) => {
        setFetchParamsStatus('finished')
        if (stdout) mainLog.info(stdout)
        if (stderr) mainLog.error(stderr)
      })
      .catch((error) => {
        setFetchParamsStatus('failed')
        mainLog.error(error)
        showErrorBox(
          t,
          t(['dialog', 'title', 'startupError']),
          t(['dialog', 'error', 'sonicsParamsFetching']),
        )
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
    ).subscribe(console.info) // eslint-disable-line no-console
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
    Promise.all([getMiningParams(), initializationPromise.then(prop('tlsParams'))])
      .then(_.mergeAll)
      .then(spawnClients)
      .catch((error) => {
        mainLog.error(error)
        return Promise.reject(error)
      })

  async function restartClients(): Promise<void> {
    if (!shuttingDown) {
      mainLog.info('restarting clients')
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

  initializationPromise.then(flatTap(() => fetchParams())).then(startClients)
  initializationPromise.then(({tlsData}) => {
    registerCertificateValidationHandler(app, tlsData, config.rpcAddress)
  })

  app.on('before-quit', killAndQuit)
  app.on('will-quit', killAndQuit)
  app.on('window-all-closed', killAndQuit)

  ipcListenToRenderer('restart-clients', async (event) => {
    try {
      await killClients()
      event.reply('restart-clients-success')
    } catch (e) {
      mainLog.error(e)
      event.reply('restart-clients-failure', e.message)
    }
  })
} else {
  openLuna(t)
}
