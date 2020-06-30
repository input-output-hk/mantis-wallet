import fs from 'fs'
import path from 'path'
import archiver from 'archiver'
import {status} from './status'
import {ClientName} from '../config/type'
import {config, loadLunaManagedConfig} from '../config/main'

const getLogPath = (clientName: ClientName, filename: string): string =>
  path.join(
    config.dataDir,
    config.clientConfigs[clientName].dataDir.directoryName,
    'logs',
    filename,
  )

export const saveLogsArchive = (filePath: string): void => {
  // Collect logs
  const nodeLogsPath = getLogPath('node', 'midnight.log')
  const walletLogsPath = getLogPath('wallet', 'midnight-wallet.log')
  const lunaStatus = JSON.stringify(
    {config, status, lunaManagedConfig: loadLunaManagedConfig()},
    null,
    2,
  )

  // Create and save archive
  const archive = archiver('zip', {
    zlib: {level: 9},
  })

  archive.append(fs.createReadStream(nodeLogsPath), {name: 'midnight.log'})
  archive.append(fs.createReadStream(walletLogsPath), {name: 'midnight-wallet.log'})
  archive.append(lunaStatus, {name: 'luna-status.log'})

  const output = fs.createWriteStream(filePath)
  archive.pipe(output)
  archive.finalize()
}
