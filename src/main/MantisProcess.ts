import {resolve} from 'path'
import * as childProcess from 'child_process'
import * as os from 'os'
import * as path from 'path'
import {promisify} from 'util'
import * as fs from 'fs'
import psTree from 'ps-tree'
import * as rxop from 'rxjs/operators'
import {EMPTY, fromEvent, interval, merge, Observable, zip} from 'rxjs'
import * as option from 'fp-ts/lib/Option'
import {pipe} from 'fp-ts/lib/pipeable'
import * as array from 'fp-ts/lib/Array'
import _ from 'lodash/fp'
import {dialog, shell, app} from 'electron'
import {ElectronLog} from 'electron-log'
import {setMantisStatus} from './status'
import {readableToObservable} from './streamUtils'
import {ClientSettings, MantisConfig, NetworkName} from '../config/type'
import {TFunctionMain} from './i18n'

const MANTIS_DOCS_URL = 'https://docs.mantisclient.io'

export const isWin = os.platform() === 'win32'

// @types/node's ChildProcess is missing exitCode property documented below:
// https://nodejs.org/api/child_process.html#child_process_subprocess_exitcode
interface ChildProcess extends childProcess.ChildProcess {
  exitCode: number | null
}

export class SpawnedMantisProcess {
  constructor(private childProcess: ChildProcess, private mainLog: ElectronLog) {
    this.mainLog.info(`Spawned Mantis, PID: ${childProcess.pid}`)
    setMantisStatus({pid: childProcess.pid, status: 'running'})
    childProcess.on('close', (code) => mainLog.info('mantis', 'stdio closed with', code))
    childProcess.on('exit', (code) => mainLog.info('mantis', 'exited with', code))
    childProcess.on('error', (err) => mainLog.error(err))
  }

  log$: Observable<string> = pipe(
    [this.childProcess.stdout, this.childProcess.stderr],
    array.map(option.fromNullable),
    array.map(option.fold(() => EMPTY, readableToObservable)),
    (observables) => merge(...observables),
    rxop.map((buffer) => buffer.toString().trim()),
  )

  close$ = zip(fromEvent(this.childProcess, 'close'), fromEvent(this.childProcess, 'exit')).pipe(
    rxop.shareReplay(1),
  )

  kill = async (): Promise<void> => {
    this.mainLog.info(`Killing Mantis, PID: ${this.childProcess.pid}`)

    if (this.childProcess.exitCode !== null) {
      this.mainLog.info(`...already exited with exit code ${this.childProcess.exitCode}`)
      setMantisStatus({status: 'notRunning'})
      return
    }

    const doKill = async (): Promise<void> => {
      if (isWin) {
        const javaPid = await promisify(psTree)(this.childProcess.pid).then(
          (children) => children.find(({COMMAND}) => COMMAND === 'java.exe')?.PID,
        )
        if (javaPid) {
          this.mainLog.info(`...killing Java process for Mantis on Win with PID ${javaPid}`)
          process.kill(parseInt(javaPid), 'SIGTERM')
        }
      } else {
        this.childProcess.kill('SIGTERM')
      }
    }

    return interval(100)
      .pipe(
        rxop.concatMap(() => doKill()),
        rxop.takeUntil(this.close$),
        rxop.mapTo(void 0),
      )
      .toPromise()
      .then(() => setMantisStatus({status: 'notRunning'}))
      .catch((err) => {
        this.mainLog.error('Got error when killing Mantis, trying again...', err)
        return this.kill()
      })
  }
}

export const processExecutablePath = (processConfig: MantisConfig): string => {
  const thePath = resolve(processConfig.packageDirectory, 'bin', processConfig.executableName)

  return isWin ? `"${thePath}.bat"` : thePath
}

export const processEnv = _.memoize(
  (processConfig: MantisConfig): NodeJS.ProcessEnv => {
    const jrePath = resolve(processConfig.packageDirectory, '..', 'jre')
    const isJreBundled: boolean = (() => {
      try {
        return fs.statSync(jrePath).isDirectory()
      } catch (e) {
        return false
      }
    })()

    return isJreBundled ? {...process.env, JAVA_HOME: jrePath} : process.env
  },
)

export const MantisProcess = (spawn: typeof childProcess.spawn) => (
  dataDir: string,
  networkName: NetworkName,
  processConfig: MantisConfig,
  mainLog: ElectronLog,
  t: TFunctionMain,
): {spawn: (additionalConfig: ClientSettings) => SpawnedMantisProcess} => {
  const executablePath = processExecutablePath(processConfig)
  const mantisDataDir = resolve(dataDir, networkName)
  const networkConfigFile = path.resolve(
    processConfig.packageDirectory,
    'conf',
    `${networkName}.conf`,
  )

  return {
    spawn: (additionalConfig: ClientSettings) => {
      const settingsAsArguments = pipe(
        {
          'config.file': networkConfigFile,
          ...processConfig.additionalSettings,
          ...additionalConfig,
          'mantis.datadir': mantisDataDir,
        },
        Object.entries,
        array.map(([key, value]) => [key, isWin ? `"${value}"` : value]),
        array.map(([key, value]) => `-D${key}=${value}`),
      )
      mainLog.info(
        `spawning Mantis (from ${
          processConfig.packageDirectory
        }): ${executablePath} ${settingsAsArguments.join(' ')}`,
      )

      const process = spawn(executablePath, ['mantis', ...settingsAsArguments], {
        cwd: processConfig.packageDirectory,
        detached: false,
        shell: isWin,
        env: processEnv(processConfig),
      })

      process.on('error', async (_) => {
        const {response} = await dialog.showMessageBox({
          message: t(['dialog', 'title', 'mantisFailedToStart']),
          detail: t(['dialog', 'message', 'mantisFailedToStart']),
          type: 'error',
          buttons: [t(['dialog', 'button', 'cancel']), t(['dialog', 'button', 'openDocs'])],
        })

        if (response === 1) {
          await shell.openExternal(MANTIS_DOCS_URL)
        }

        app.quit()
      })

      return new SpawnedMantisProcess(process as ChildProcess, mainLog)
    },
  }
}
