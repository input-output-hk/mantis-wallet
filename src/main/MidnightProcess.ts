import * as path from 'path'
import {resolve} from 'path'
import * as childProcess from 'child_process'
import * as rxop from 'rxjs/operators'
import {EMPTY, fromEvent, generate, merge, Observable} from 'rxjs'
import * as option from 'fp-ts/lib/Option'
import * as record from 'fp-ts/lib/Record'
import {pipe} from 'fp-ts/lib/pipeable'
import * as array from 'fp-ts/lib/Array'
import {readableToObservable} from './streamUtils'
import {ClientName, ProcessConfig} from '../config/type'

// @types/node's ChildProcess is missing exitCode property documented below:
// https://nodejs.org/api/child_process.html#child_process_subprocess_exitcode
interface ChildProcess extends childProcess.ChildProcess {
  exitCode: number | null
}

export class SpawnedMidnightProcess {
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

  kill = async (): Promise<void> => {
    console.info(`Killing ${this.name}, PID: ${this.childProcess.pid}`)
    if (this.childProcess.exitCode !== null) {
      console.info(`...already exited with exit code ${this.childProcess.exitCode}`)
    }
    return generate({
      initialState: 0,
      iterate: (nr) => nr + 1,
    })
      .pipe(
        rxop.takeWhile(() => !this.childProcess.killed && this.childProcess.exitCode === null),
        rxop.tap(() => {
          this.childProcess.kill()
        }),
        rxop.map(() => void 0),
      )
      .toPromise()
  }
}

export const MidnightProcess = (spawn: typeof childProcess.spawn) => (
  name: ClientName,
  dataDir: string,
  processConfig: ProcessConfig,
) => {
  const executablePath = resolve(
    processConfig.packageDirectory,
    'bin',
    processConfig.executableName,
  )
  const settingsAsArguments = pipe(
    processConfig.additionalSettings,
    record.insertAt(
      processConfig.dataDir.settingName,
      path.resolve(dataDir, processConfig.dataDir.directoryName),
    ),
    Object.entries,
    array.map(([key, value]) => `-D${key}=${value}`),
  )

  return {
    spawn: () => {
      console.info(
        `spawning ${name} (from ${processConfig.packageDirectory}): ${executablePath} ${settingsAsArguments}`,
      )
      return new SpawnedMidnightProcess(
        name,
        spawn(executablePath, settingsAsArguments, {
          cwd: processConfig.packageDirectory,
          detached: true,
        }) as ChildProcess,
      )
    },
  }
}
