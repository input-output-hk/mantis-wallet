import {resolve} from 'path'
import * as childProcess from 'child_process'
import * as os from 'os'
import {promisify} from 'util'
import * as fs from 'fs'
import psTree from 'ps-tree'
import * as rxop from 'rxjs/operators'
import {EMPTY, fromEvent, interval, merge, Observable, zip} from 'rxjs'
import * as option from 'fp-ts/lib/Option'
import {pipe} from 'fp-ts/lib/pipeable'
import * as array from 'fp-ts/lib/Array'
import _ from 'lodash/fp'
import {setMantisStatus} from './status'
import {readableToObservable} from './streamUtils'
import {ClientSettings, MantisConfig, NetworkName} from '../config/type'
import {mainLog} from './logger'

export const isWin = os.platform() === 'win32'

// @types/node's ChildProcess is missing exitCode property documented below:
// https://nodejs.org/api/child_process.html#child_process_subprocess_exitcode
interface ChildProcess extends childProcess.ChildProcess {
  exitCode: number | null
}

export class SpawnedMantisProcess {
  constructor(private childProcess: ChildProcess) {
    mainLog.info(`Spawned Mantis, PID: ${childProcess.pid}`)
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
    mainLog.info(`Killing Mantis, PID: ${this.childProcess.pid}`)
    if (isWin) {
      const javaPid = await promisify(psTree)(this.childProcess.pid).then(
        (children) => children.find(({COMMAND}) => COMMAND === 'java.exe')?.PID,
      )
      if (javaPid) {
        mainLog.info(`...killing Java process for Mantis on Win with PID ${javaPid}`)
        process.kill(parseInt(javaPid))
      }
    }
    if (this.childProcess.exitCode !== null) {
      mainLog.info(`...already exited with exit code ${this.childProcess.exitCode}`)
    }
    return interval(100)
      .pipe(
        rxop.tap(() => this.childProcess.kill()),
        rxop.takeUntil(this.close$),
        rxop.mapTo(void 0),
      )
      .toPromise()
      .then(() => setMantisStatus({status: 'notRunning'}))
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
) => {
  const executablePath = processExecutablePath(processConfig)
  const mantisDataDir = resolve(dataDir, processConfig.dataDirName)

  return {
    spawn: (additionalConfig: ClientSettings) => {
      const settingsAsArguments = pipe(
        {
          ...processConfig.additionalSettings,
          ...additionalConfig,
          'mantis.datadir': mantisDataDir,
          'mantis.blockchains.network': networkName,
        },
        Object.entries,
        array.map(([key, value]) => `-D${key}=${value}`),
      )
      mainLog.info(
        `spawning Mantis (from ${
          processConfig.packageDirectory
        }): ${executablePath} ${settingsAsArguments.join(' ')}`,
      )
      return new SpawnedMantisProcess(
        spawn(executablePath, settingsAsArguments, {
          cwd: processConfig.packageDirectory,
          detached: false,
          shell: isWin,
          env: processEnv(processConfig),
        }) as ChildProcess,
      )
    },
  }
}