/* eslint-disable no-console */
import {promisify} from 'util'
import path from 'path'
import {promises as fs, constants as fsConstants} from 'fs'
import {satisfies, coerce} from 'semver'
import rimraf from 'rimraf'
import {dialog} from 'electron'
import {DATADIR_VERSION, COMPATIBLE_VERSIONS} from '../shared/version'
import {createAndInitI18nForMain, createTFunctionMain} from './i18n'
import {DEFAULT_LANGUAGE} from '../shared/i18n'

// Do not export
const Checked: unique symbol = Symbol()

export class CheckedDatadir {
  constructor(public datadirPath: string, private _checked: typeof Checked) {}
}

const getVersionFilePath = (datadirPath: string): string => path.resolve(datadirPath, 'version.txt')

interface DatadirCompatibility {
  isCompatible: boolean
  datadirVersion: string
}

const createVersionFile = (datadirPath: string): Promise<void> =>
  fs.writeFile(getVersionFilePath(datadirPath), DATADIR_VERSION, 'utf8')

const initDataDir = async (datadirPath: string): Promise<void> => {
  await fs.mkdir(datadirPath)
  await createVersionFile(datadirPath)
}

const isDirEmpty = (dir: string): Promise<boolean> =>
  fs.readdir(dir).then((files) => files.length === 0)

const checkDatadirVersion = async (datadirPath: string): Promise<DatadirCompatibility> => {
  // Load dataDir version and check if it's compatible
  try {
    const datadirVersion = (await fs.readFile(getVersionFilePath(datadirPath), 'utf8')).trim()
    const coercedVersion = coerce(datadirVersion)
    console.info(`Data dir version: ${datadirVersion} (${coercedVersion})`)
    console.info(`Compatible versions: ${COMPATIBLE_VERSIONS}`)
    const isCompatible = satisfies(coercedVersion || datadirVersion, COMPATIBLE_VERSIONS)

    return {
      isCompatible,
      datadirVersion,
    }
  } catch (e) {
    if (e.code !== 'ENOENT') {
      console.error(e)
      // Abort in case the problem is not that it doesn't exist
      throw e
    }
  }

  // Check if data directory exists and is not empty
  try {
    await fs.access(datadirPath, fsConstants.W_OK | fsConstants.R_OK)
    const isDataDirEmpty = await isDirEmpty(datadirPath)

    // If dataDir already exists and it is empty we can use it
    if (isDataDirEmpty) {
      await createVersionFile(datadirPath)
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
    await initDataDir(datadirPath)
    return {
      isCompatible: true,
      datadirVersion: DATADIR_VERSION,
    }
  }
}

const CANCELLED_BY_USER = Error('Cancelled by user')

export async function checkDatadirCompatibility(datadirPath: string): Promise<CheckedDatadir> {
  const {isCompatible, datadirVersion} = await checkDatadirVersion(datadirPath)
  if (isCompatible) return new CheckedDatadir(datadirPath, Checked)

  const i18n = createAndInitI18nForMain(DEFAULT_LANGUAGE)
  const t = createTFunctionMain(i18n)

  const oldDirName = path.basename(datadirPath)
  const newDirName = `${oldDirName}-${datadirVersion}`

  const userResponse = await dialog.showMessageBox({
    type: 'error',
    buttons: [t(['dialog', 'button', 'ok']), t(['dialog', 'button', 'cancel'])],
    title: t(['dialog', 'title', 'incompatibleDataDir']),
    message: t(['dialog', 'message', 'incompatibleDataDir']),
    detail: t(['dialog', 'message', 'incompatibleDataDirAction'], {
      replace: {oldDirName, newDirName},
    }),
    checkboxLabel: t(['dialog', 'checkboxLabel', 'deleteCurrentDataDir']),
    checkboxChecked: false,
  })
  const {checkboxChecked, response} = userResponse

  if (response === 1) {
    // Cancel
    throw CANCELLED_BY_USER
  } else if (checkboxChecked) {
    // Delete option
    const {response} = await dialog.showMessageBox({
      type: 'warning',
      buttons: [t(['dialog', 'button', 'ok']), t(['dialog', 'button', 'cancel'])],
      message: t(['dialog', 'message', 'deleteDirectoryQuestion'], {
        replace: {directory: datadirPath},
      }),
    })
    if (response === 1) {
      // Cancel delete
      throw CANCELLED_BY_USER
    } else {
      // Actually delete datadir
      await promisify(rimraf)(datadirPath)
    }
  } else {
    // Rename option
    const parent = path.dirname(datadirPath)
    const newDatadirPath = path.join(parent, newDirName)
    await fs.rename(datadirPath, newDatadirPath)
  }

  // Initialize new dataDir with version.txt
  await initDataDir(datadirPath)

  await dialog.showMessageBox({
    message: t(['dialog', 'message', 'operationComplete']),
    buttons: [t(['dialog', 'button', 'ok'])],
  })
  return new CheckedDatadir(datadirPath, Checked)
}
