import {promisify} from 'util'
import path from 'path'
import {promises as fs, constants as fsConstants} from 'fs'
import {satisfies, coerce} from 'semver'
import rimraf from 'rimraf'
import {app, dialog} from 'electron'
import {DATADIR_VERSION, COMPATIBLE_VERSIONS} from '../shared/version'
import {config} from '../config/main'

const versionFilePath = path.resolve(config.dataDir, 'version.txt')

interface DatadirCompatibility {
  isCompatible: boolean
  datadirVersion: string
}

const initDataDir = async (): Promise<void> => {
  await fs.mkdir(config.dataDir)
  await fs.writeFile(versionFilePath, DATADIR_VERSION, 'utf8')
}

const checkDatadirVersion = async (): Promise<DatadirCompatibility> => {
  // Load dataDir version and check if it's compatible
  try {
    const datadirVersion = (await fs.readFile(versionFilePath, 'utf8')).trim()
    const coercedVersion = coerce(datadirVersion)
    console.info(`Data dir version: ${datadirVersion} (${coercedVersion})`)
    console.info(`Compatible versions: ${COMPATIBLE_VERSIONS}`)
    const isCompatible = satisfies(coercedVersion || datadirVersion, COMPATIBLE_VERSIONS)

    return {
      isCompatible,
      datadirVersion,
    }
  } catch (e) {
    console.error(e)
    if (e.code !== 'ENOENT') {
      // Abort in case the problem is not that it doesn't exist
      throw e
    }
  }

  // Check if data directory exists
  try {
    await fs.access(config.dataDir, fsConstants.W_OK | fsConstants.R_OK)
    // If dataDir already exists, but doesn't contain a version.txt: incompatible
    return {
      isCompatible: false,
      datadirVersion: 'unknown',
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

export async function checkDatadirCompatibility(): Promise<void> {
  const {isCompatible, datadirVersion} = await checkDatadirVersion()
  if (isCompatible) return

  const oldDirName = path.basename(config.dataDir)
  const newDirName = `${oldDirName}-${datadirVersion}`

  const userResponse = await dialog.showMessageBox({
    type: 'error',
    buttons: ['OK', 'Cancel'],
    title: 'Incompatible data directory',
    message: 'Your current data directory is incompatible with this version of Luna.',
    detail: `We'll rename your old data directory from "${oldDirName}" to "${newDirName}".`,
    checkboxLabel: 'Delete my current data directory instead',
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
      buttons: ['OK', 'Cancel'],
      message: `Are you sure you want to delete "${config.dataDir}"?`,
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

  await dialog.showMessageBox({message: 'Operation complete.', buttons: ['OK']})
}
