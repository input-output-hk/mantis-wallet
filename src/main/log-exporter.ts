import fs from 'fs'
import path from 'path'
import archiver from 'archiver'
import {status} from './status'
import {MainStore} from './store'
import {Config} from '../config/type'

const getBackendLogPath = (config: Config, store: MainStore): string =>
  path.join(config.dataDir, config.mantis.dataDirName, store.get('networkName'), 'logs')

export const saveLogsArchive = async (
  config: Config,
  store: MainStore,
  filePath: string,
): Promise<void> => {
  const mantisWalletStatus = JSON.stringify({config, status}, null, 2)

  // Create and save archive
  const archive = archiver('zip', {
    zlib: {level: 9},
  })

  archive.directory(getBackendLogPath(config, store), false)
  archive.directory(path.join(config.dataDir, 'logs'), false)
  archive.append(mantisWalletStatus, {name: 'mantis-wallet-status.log'})

  const output = fs.createWriteStream(filePath)
  archive.pipe(output)
  await archive.finalize()
}
