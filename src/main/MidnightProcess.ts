import * as path from 'path'
import {resolve} from 'path'
import * as childProcess from 'child_process'
import * as os from 'os'
import {promisify} from 'util'
import psTree from 'ps-tree'
import * as rxop from 'rxjs/operators'
import {EMPTY, fromEvent, generate, merge, interval, Observable} from 'rxjs'
import * as option from 'fp-ts/lib/Option'
import {pipe} from 'fp-ts/lib/pipeable'
import * as array from 'fp-ts/lib/Array'
import {ClientName, ClientSettings, ProcessConfig} from '../config/type'
import {readableToObservable} from './streamUtils'

const isWin = os.platform() === 'win32'

// @types/node's ChildProcess is missing exitCode property documented below:
// https://nodejs.org/api/child_process.html#child_process_subprocess_exitcode
interface ChildProcess extends childProcess.ChildProcess {
  exitCode: number | null
}

export class SpawnedMidnightProcess {
  private javaPidPromise: Promise<number> = isWin
    ? interval(10)
        .pipe(
          rxop.concatMap(() =>
            this.isRunning() ? Promise.resolve() : Promise.reject('Process is not running...'),
          ),
          rxop.concatMap(() => promisify(psTree)(this.childProcess.pid)),
          rxop.map((children) => children.find(({COMMAND}) => COMMAND === 'java.exe')?.PID),
          rxop.filter((pid): pid is string => pid != null),
          rxop.first(),
          rxop.map(parseInt),
        )
        .toPromise()
    : Promise.resolve(this.childProcess.pid)

  constructor(public name: ClientName, private childProcess: ChildProcess) {
    console.info(`Spawned ${name}, PID: ${childProcess.pid}`)
    childProcess.on('close', (code) => console.info('exited with', code))
    childProcess.on('error', (err) => console.error(err))
  }

  log$: Observable<string> = pipe(
    [this.childProcess.stdout, this.childProcess.stderr],
    array.map(option.fromNullable),
    array.map(option.fold(() => EMPTY, readableToObservable)),
    (observables) => merge(...observables),
    rxop.map((buffer) => buffer.toString().trim()),
  )

  close$ = merge(fromEvent(this.childProcess, 'close'), fromEvent(this.childProcess, 'exit'))

  private isRunning = (): boolean =>
    !this.childProcess.killed && this.childProcess.exitCode === null

  kill = async (): Promise<void> => {
    console.info(`Killing ${this.name}, PID: ${this.childProcess.pid}`)
    if (isWin) {
      const javaPid = await this.javaPidPromise
      console.info(`...killing Java process on Win with PID ${javaPid}`)
      process.kill(javaPid)
    }
    if (this.childProcess.exitCode !== null) {
      console.info(`...already exited with exit code ${this.childProcess.exitCode}`)
    }
    return generate({
      initialState: 0,
      iterate: (nr) => nr + 1,
    })
      .pipe(
        rxop.takeWhile(this.isRunning),
        rxop.tap(() => {
          this.childProcess.kill()
        }),
        rxop.map(() => void 0),
      )
      .toPromise()
  }
}

export const processExecutablePath = (processConfig: ProcessConfig): string => {
  const thePath = resolve(processConfig.packageDirectory, 'bin', processConfig.executableName)

  return isWin ? `"${thePath}.bat"` : thePath
}

export const MidnightProcess = (spawn: typeof childProcess.spawn) => (
  name: ClientName,
  dataDir: string,
  processConfig: ProcessConfig,
) => {
  const executablePath = processExecutablePath(processConfig)

  return {
    name,
    spawn: (additionalConfig: ClientSettings) => {
      const settingsAsArguments = pipe(
        {
          ...processConfig.additionalSettings,
          ...additionalConfig,
          [processConfig.dataDir.settingName]: path.resolve(
            dataDir,
            processConfig.dataDir.directoryName,
          ),
        },
        Object.entries,
        array.map(([key, value]) => `-D${key}=${value}`),
      )
      console.info(
        `spawning ${name} (from ${
          processConfig.packageDirectory
        }): ${executablePath} ${settingsAsArguments.join(' ')}`,
      )
      return new SpawnedMidnightProcess(
        name,
        spawn(executablePath, settingsAsArguments, {
          cwd: processConfig.packageDirectory,
          detached: false,
          shell: isWin,
        }) as ChildProcess,
      )
    },
  }
}
