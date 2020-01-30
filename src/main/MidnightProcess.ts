import {EMPTY, fromEvent, generate, merge, Observable} from 'rxjs'
import * as rxop from 'rxjs/operators'
import * as path from 'path'
import {resolve} from 'path'
import * as childProcess from 'child_process'
import * as option from 'fp-ts/lib/Option'
import * as record from 'fp-ts/lib/Record'
import {pipe} from 'fp-ts/lib/pipeable'
import * as array from 'fp-ts/lib/Array'
import {readableToObservable} from './streamUtils'
import {ClientName, ProcessConfig} from '../config/type'

export class SpawnedMidnightProcess {
  constructor(public name: ClientName, private childProcess: childProcess.ChildProcess) {
    childProcess.on('close', (code) => console.log('exited with', code))
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

  kill = async (): Promise<void> =>
    generate({
      initialState: 0,
      iterate: (nr) => nr + 1,
    })
      .pipe(
        rxop.takeWhile(() => !this.childProcess.killed),
        rxop.tap(() => {
          this.childProcess.kill()
        }),
        rxop.map(() => void 0),
      )
      .toPromise()
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
      console.log(
        `spawning ${name} (from ${processConfig.packageDirectory}): ${executablePath} ${settingsAsArguments}`,
      )
      return new SpawnedMidnightProcess(
        name,
        spawn(executablePath, settingsAsArguments, {
          cwd: processConfig.packageDirectory,
          detached: true,
        }),
      )
    },
  }
}
