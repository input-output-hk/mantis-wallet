import fs from 'fs'
import path from 'path'
import archiver from 'archiver'
import {status} from './status'
import {Config} from '../config/type'

const getBackendLogPath = (config: Config): string =>
  path.join(config.dataDir, config.mantis.dataDirName, 'logs')

export const saveLogsArchive = async (config: Config, filePath: string): Promise<void> => {
  const lunaStatus = JSON.stringify({config, status}, null, 2)

  // Create and save archive
  const archive = archiver('zip', {
    zlib: {level: 9},
  })

  archive.directory(getBackendLogPath(config), false)
  archive.directory(path.join(config.dataDir, 'logs'), false)
  archive.append(lunaStatus, {name: 'luna-status.log'})

  const output = fs.createWriteStream(filePath)
  archive.pipe(output)
  await archive.finalize()
}
