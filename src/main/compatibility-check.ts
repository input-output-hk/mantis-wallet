import {promisify} from 'util'
import path from 'path'
import {promises as fs, constants as fsConstants} from 'fs'
import {satisfies, coerce} from 'semver'
import rimraf from 'rimraf'
import {app, dialog} from 'electron'
import {DATADIR_VERSION, COMPATIBLE_VERSIONS} from '../shared/version'
import {config} from '../config/main'
import {mainLog} from './logger'
import {TFunctionMain} from './i18n'

const versionFilePath = path.resolve(config.dataDir, 'version.txt')

interface DatadirCompatibility {
  isCompatible: boolean
  datadirVersion: string
}

const createVersionFile = (): Promise<void> =>
  fs.writeFile(versionFilePath, DATADIR_VERSION, 'utf8')

const initDataDir = async (): Promise<void> => {
  await fs.mkdir(config.dataDir)
  await createVersionFile()
}

const isDirEmpty = (dir: string): Promise<boolean> =>
  fs.readdir(dir).then((files) => files.length === 0)

const checkDatadirVersion = async (): Promise<DatadirCompatibility> => {
  // Load dataDir version and check if it's compatible
  try {
    const datadirVersion = (await fs.readFile(versionFilePath, 'utf8')).trim()
    const coercedVersion = coerce(datadirVersion)
    mainLog.info(`Data dir version: ${datadirVersion} (${coercedVersion})`)
    mainLog.info(`Compatible versions: ${COMPATIBLE_VERSIONS}`)
    const isCompatible = satisfies(coercedVersion || datadirVersion, COMPATIBLE_VERSIONS)

    return {
      isCompatible,
      datadirVersion,
    }
  } catch (e) {
    if (e.code !== 'ENOENT') {
      mainLog.error(e)
      // Abort in case the problem is not that it doesn't exist
      throw e
    }
  }

  // Check if data directory exists and is not empty
  try {
    await fs.access(config.dataDir, fsConstants.W_OK | fsConstants.R_OK)
    const isDataDirEmpty = await isDirEmpty(config.dataDir)

    // If dataDir already exists and it is empty we can use it
    if (isDataDirEmpty) {
      await createVersionFile()
      return {
        isCompatible: true,
        datadirVersion: DATADIR_VERSION,
      }
    } else {
      // non-empty and doesn't contain a version.txt: incompatible
      return {
        isCompatible: false,
        datadirVersion: 'unknown',
      }
    }
  } catch (e) {
    // If dataDir doesn't exist, initialize new one with version.txt
    await initDataDir()
    return {
      isCompatible: true,
      datadirVersion: DATADIR_VERSION,
    }
  }
}

export async function checkDatadirCompatibility(t: TFunctionMain): Promise<void> {
  const {isCompatible, datadirVersion} = await checkDatadirVersion()
  if (isCompatible) return

  const oldDirName = path.basename(config.dataDir)
  const newDirName = `${oldDirName}-${datadirVersion}`

  const userResponse = await dialog.showMessageBox({
    type: 'error',
    buttons: [t(['dialog', 'button', 'ok']), t(['dialog', 'button', 'cancel'])],
    title: t(['dialog', 'title', 'incompatibleDataDir']),
    message: t(['dialog', 'message', 'incompatibleDataDir']),
    detail: t(['dialog', 'message', 'incompatibleDataDirAction'], {oldDirName, newDirName}),
    checkboxLabel: t(['dialog', 'checkboxLabel', 'deleteCurrentDataDir']),
    checkboxChecked: false,
  })
  const {checkboxChecked, response} = userResponse

  if (response === 1) {
    // Cancel
    return app.exit(1)
  } else if (checkboxChecked) {
    // Delete option
    const {response} = await dialog.showMessageBox({
      type: 'warning',
      buttons: [t(['dialog', 'button', 'ok']), t(['dialog', 'button', 'cancel'])],
      message: t(['dialog', 'message', 'deleteDirectoryQuestion'], {directory: config.dataDir}),
    })
    if (response === 1) {
      // Cancel delete
      return app.exit(1)
    } else {
      // Actually delete datadir
      await promisify(rimraf)(config.dataDir)
    }
  } else {
    // Rename option
    const parent = path.dirname(config.dataDir)
    const newDatadirPath = path.join(parent, newDirName)
    await fs.rename(config.dataDir, newDatadirPath)
  }

  // Initialize new dataDir with version.txt
  await initDataDir()

  await dialog.showMessageBox({
    message: t(['dialog', 'message', 'operationComplete']),
    buttons: [t(['dialog', 'button', 'ok'])],
  })
}
