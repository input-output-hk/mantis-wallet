// This file is an entry point to whole application, it simply doesn't make sense to keep it 100% pure
/* eslint-disable fp/no-let, fp/no-mutation */
import path from 'path'
import url from 'url'
import os from 'os'
import {spawn} from 'child_process'
import {option} from 'fp-ts'
import * as rxop from 'rxjs/operators'
import {pipe} from 'fp-ts/lib/pipeable'
import {app, BrowserWindow, dialog, Menu, screen} from 'electron'
import {MantisProcess, SpawnedMantisProcess} from './MantisProcess'
import {
  configToParams,
  registerCertificateValidationHandler,
  setupExternalTLS,
  setupOwnTLS,
} from './tls'
import {prop} from '../shared/utils'
import {config} from '../config/main'
import {buildMenu} from './menu'
import {getTitle, ipcListenToRenderer, showErrorBox} from './util'
import {inspectLineForDAGStatus, setNetworkTag, status} from './status'
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
import {checkPortUsage} from './port-usage-check'
import {ClientSettings} from '../config/type'

const IS_LINUX = os.type() == 'Linux'
const LINUX_ICON = path.join(__dirname, '/../icon.png')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindowHandle: BrowserWindow | null = null

let shuttingDown = false

if (!app.requestSingleInstanceLock()) {
  app.quit()
}

const i18n = createAndInitI18nForMain(store.get('settings.language') || DEFAULT_LANGUAGE)
const t = createTFunctionMain(i18n)

function createWindow(t: TFunctionMain): void {
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
    // titleBarStyle: 'hidden', FIXME: PM-2413
  })

  Menu.setApplicationMenu(buildMenu(t))

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
  lunaConfig: () => pipe(config, (cfg) => ({...cfg, rpcAddress: cfg.rpcAddress.href})),
  lunaStatus: () => status,
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

app.on('second-instance', () => {
  if (mainWindowHandle) {
    if (mainWindowHandle.isMinimized()) mainWindowHandle.restore()
    mainWindowHandle.focus()
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
    await saveLogsArchive(config, filePath)
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
      Menu.setApplicationMenu(buildMenu(t))
      mainWindowHandle?.setTitle(getTitle(t, status.info.networkTag))
    })
  }
})

// Handle TLS from external config
if (!config.runNode) {
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
if (config.runNode) {
  const initializationPromise = checkDatadirCompatibility(t)
    .then(() =>
      mainLog.info({
        versions: process.versions,
        config,
      }),
    )
    .then(() => checkPortUsage(config))
    .then(() => openLuna(t))
    .then(() => setupOwnTLS(config.mantis))
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

  let runningMantis: SpawnedMantisProcess | null = null

  function logMantis(spawnedMantis: SpawnedMantisProcess): void {
    spawnedMantis.log$
      .pipe(
        rxop.tap(inspectLineForDAGStatus),
        rxop.map((line) => `mantis | ${line}`),
      )
      .subscribe(console.info) // eslint-disable-line no-console
  }

  function spawnMantis(additionalSettings: ClientSettings): void {
    const mantisProcess = MantisProcess(spawn)(config.dataDir, config.networkName, config.mantis)
    const spawnedMantis = mantisProcess.spawn(additionalSettings)
    logMantis(spawnedMantis)

    spawnedMantis.close$
      .pipe(
        rxop.take(1),
        rxop.tap(() => mainLog.info('Mantis got closed. Restarting')),
      )
      .subscribe(restartMantis)

    runningMantis = spawnedMantis
  }

  const killMantis = async (): Promise<void> =>
    runningMantis
      ? runningMantis.kill().then(() => {
          runningMantis = null
        })
      : Promise.resolve()

  const startMantis = (): Promise<void> =>
    initializationPromise
      .then(prop('tlsParams'))
      .then(spawnMantis)
      .catch((error) => {
        mainLog.error(error)
        return Promise.reject(error)
      })

  async function restartMantis(): Promise<void> {
    if (!shuttingDown) {
      mainLog.info('restarting Mantis')
      return killMantis().then(startMantis)
    }
  }

  function killAndQuit(event: Event): void {
    shuttingDown = true
    if (runningMantis) {
      event.preventDefault()
      killMantis().then(() => app.quit())
    }
  }

  initializationPromise.then(startMantis)
  initializationPromise.then(({tlsData}) => {
    registerCertificateValidationHandler(app, tlsData, config.rpcAddress)
  })

  app.on('before-quit', killAndQuit)
  app.on('will-quit', killAndQuit)
  app.on('window-all-closed', killAndQuit)
} else {
  openLuna(t)
}
