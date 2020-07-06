import fs from 'fs'
import path from 'path'
import archiver from 'archiver'
import {status} from './status'
import {ClientName} from '../config/type'
import {config, loadLunaManagedConfig} from '../config/main'

const getBackendLogPath = (clientName: ClientName): string =>
  path.join(config.dataDir, config.clientConfigs[clientName].dataDir.directoryName, 'logs')

export const saveLogsArchive = (filePath: string): void => {
  const lunaStatus = JSON.stringify(
    {config, status, lunaManagedConfig: loadLunaManagedConfig()},
    null,
    2,
  )

  // Create and save archive
  const archive = archiver('zip', {
    zlib: {level: 9},
  })

  archive.directory(getBackendLogPath('node'), false)
  archive.directory(getBackendLogPath('wallet'), false)
  archive.directory(path.join(config.dataDir, 'logs'), false)
  archive.append(lunaStatus, {name: 'luna-status.log'})

  const output = fs.createWriteStream(filePath)
  archive.pipe(output)
  archive.finalize()
}
