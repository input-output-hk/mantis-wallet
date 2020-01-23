import {EMPTY, fromEvent, interval, merge, Observable} from 'rxjs'
import * as rxop from 'rxjs/operators'
import psList from 'ps-list'
import {resolve} from 'path'
import * as childProcess from 'child_process'
import * as option from 'fp-ts/lib/Option'
import {pipe} from 'fp-ts/lib/pipeable'
import * as array from 'fp-ts/lib/Array'
import {readableToObservable} from './streamUtils'
import {ClientName, ProcessConfig} from './config'

export class SpawnedMidnightProcess {
  constructor(public name: ClientName, private childProcess: childProcess.ChildProcess) {}

  log$: Observable<string> = pipe(
    [this.childProcess.stdout, this.childProcess.stderr],
    array.map(option.fromNullable),
    array.map(option.fold(() => EMPTY, readableToObservable)),
    (observables) => merge(...observables),
    rxop.map((buffer) => buffer.toString().trim()),
  )

  close$ = merge(fromEvent(this.childProcess, 'close'), fromEvent(this.childProcess, 'exit'))

  isAlive = async () =>
    psList().then(
      (processes) => processes.find((proc) => proc.pid === this.childProcess.pid) != null,
    )

  kill = async () =>
    interval(100)
      .pipe(
        rxop.concatMap(() => new Promise((resolve) => resolve(this.childProcess.kill()))),
        rxop.concatMap(() => this.isAlive()),
        rxop.filter((isAlive) => !isAlive),
        rxop.take(1),
      )
      .toPromise()
}

export const MidnightProcess = (spawn: typeof childProcess.spawn) => (
  name: ClientName,
  processConfig: ProcessConfig,
) => {
  const executablePath = resolve(
    processConfig.packageDirectory,
    'bin',
    processConfig.executableName,
  )
  const settingsAsArguments = Array.from(processConfig.additionalSettings.entries()).map(
    ([key, value]) => `-D${key}=${value}`,
  )

  return {
    spawn: () =>
      new SpawnedMidnightProcess(
        name,
        spawn(executablePath, settingsAsArguments, {cwd: processConfig.packageDirectory}),
      ),
  }
}
