import fs from 'fs'
import path from 'path'
import archiver from 'archiver'
import {Config} from '../config/type'
import {status} from './status'
import {MainStore} from './store'
import {CheckedDatadir, getMantisDatadirPath} from './data-dir'

export const createLogExporter = (_checkedDatadir: CheckedDatadir) => async (
  config: Config,
  store: MainStore,
  outputFilePath: string,
): Promise<void> => {
  // Create and save archive

  const archive = archiver('zip', {
    zlib: {level: 9},
  })

  const mantisDatadirPath = getMantisDatadirPath(config, store)

  const backendLogPath = path.join(mantisDatadirPath, store.get('networkName'), 'logs')
  const walletLogPath = path.join(config.walletDataDir, 'logs')
  const configAndStatusText = JSON.stringify({config, status}, null, 2)

  archive
    .directory(backendLogPath, false)
    .directory(walletLogPath, false)
    .append(configAndStatusText, {name: 'wallet-config-and-status.json'})

  const output = fs.createWriteStream(outputFilePath)
  archive.pipe(output)
  await archive.finalize()
}
