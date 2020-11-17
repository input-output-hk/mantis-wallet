import fs from 'fs'
import path from 'path'
import archiver from 'archiver'
import {Config} from '../config/type'
import {status} from './status'
import {MainStore} from './store'
import {CheckedDatadir} from './data-dir'

export const createLogExporter = (checkedDatadir: CheckedDatadir) => async (
  config: Config,
  store: MainStore,
  outputFilePath: string,
): Promise<void> => {
  // Create and save archive

  const archive = archiver('zip', {
    zlib: {level: 9},
  })

  const backendLogPath = path.join(
    checkedDatadir.datadirPath,
    config.mantis.dataDirName,
    store.get('networkName'),
    'logs',
  )
  const walletLogPath = path.join(checkedDatadir.datadirPath, 'logs')
  const mantisWalletStatus = JSON.stringify({config, status}, null, 2)

  archive
    .directory(backendLogPath, false)
    .directory(walletLogPath, false)
    .append(mantisWalletStatus, {name: 'mantis-wallet-status.log'})

  const output = fs.createWriteStream(outputFilePath)
  archive.pipe(output)
  await archive.finalize()
}
