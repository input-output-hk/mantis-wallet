/* eslint-disable no-console */
import * as path from 'path'
import * as childProcess from 'child_process'
import {promisify} from 'util'
import {promises as fs} from 'fs'
import decompress from 'decompress'
import rimraf from 'rimraf'
import {array, option} from 'fp-ts'
import {Option} from 'fp-ts/lib/Option'
import {through} from '../src/shared/utils'

const spawnAsync = async (
  command: string,
  args: readonly string[],
  options: childProcess.SpawnOptionsWithoutStdio,
): Promise<void> =>
  new Promise((resolve, reject) => {
    const builder = childProcess.spawn(command, options)

    builder.stdout.pipe(process.stdout)
    builder.stderr.pipe(process.stderr)

    builder.once('exit', (code) =>
      code == 0
        ? resolve()
        : reject(
            Error(
              `Process ${command} ${args.join(' ')} from ${
                options.cwd
              } failed with exit code ${code}`,
            ),
          ),
    )
  })

const ensureSubmodules = async (mantisDir: string): Promise<void> => {
  console.log('Ensuring all Mantis submodules are in place')
  const additionalOptions = {shell: true, windowsHide: true, cwd: mantisDir}
  await spawnAsync('git submodule init', [], additionalOptions)
  await spawnAsync('git submodule update', ['--recursive'], additionalOptions)
}

const buildMantis = (mantisDir: string): Promise<void> => {
  console.log('Building Mantis')
  return spawnAsync('sbt update dist', [], {shell: true, windowsHide: true, cwd: mantisDir})
}

const clearMantisDist = async (distPath: string): Promise<void> => {
  console.log(`Clearing ${distPath}`)
  return promisify(rimraf)(distPath)
}

const clearUniversalDir = async (universalDir: string): Promise<void> => {
  console.log(`Clearing ${universalDir}`)
  return promisify(rimraf)(universalDir)
}

const extractMantis = async (distZipPath: string, distPath: string): Promise<decompress.File[]> => {
  console.log(`Extracting Mantis to ${distPath}`)
  return decompress(distZipPath, distPath, {strip: 1})
}

const projectRoot = path.resolve(__dirname, '..')
const mantisDir = path.resolve(projectRoot, 'mantis')
const mantisUniversalDir = path.resolve(mantisDir, 'target', 'universal')
const mantisDistZip = (universalDir: string): Promise<Option<string>> =>
  fs.readdir(universalDir).then(
    through(
      array.findFirst((name) => name.endsWith('.zip')),
      option.map((name) => path.resolve(universalDir, name)),
    ),
  )

const mantisDistDir = path.resolve(projectRoot, '..', 'mantis-dist', 'mantis')

ensureSubmodules(mantisDir)
  .then(() => clearUniversalDir(mantisUniversalDir))
  .then(() => buildMantis(mantisDir))
  .then(() => clearMantisDist(mantisDistDir))
  .then(() => mantisDistZip(mantisUniversalDir))
  .then(
    option.fold(
      () =>
        Promise.reject(
          Error(`Couldn't find built zip file with Mantis in directory ${mantisUniversalDir}`),
        ),
      (distZipPath) => extractMantis(distZipPath, mantisDistDir),
    ),
  )
  .then(() => console.log('Mantis build completed'))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
