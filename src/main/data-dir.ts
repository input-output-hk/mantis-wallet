/* eslint-disable no-console */
import {promisify} from 'util'
import path from 'path'
import {promises as fs, constants as fsConstants} from 'fs'
import {satisfies, coerce} from 'semver'
import rimraf from 'rimraf'
import {BrowserWindow, dialog} from 'electron'
import {DATADIR_VERSION, COMPATIBLE_VERSIONS} from '../shared/version'
import {Config} from '../config/type'
import {TFunctionMain} from './i18n'
import {isDirEmpty} from './util'
import {MainStore} from './store'

const NODE_DIR_NAME = 'mantis'
const NO_VERSION = 'unknown'

// Do not export
const Checked: unique symbol = Symbol()

export class CheckedDatadir {
  constructor(public datadirPath: string, private _checked: typeof Checked) {}
}

const getVersionFilePath = (datadirPath: string): string => path.resolve(datadirPath, 'version.txt')

const createVersionFile = (datadirPath: string): Promise<void> =>
  fs.writeFile(getVersionFilePath(datadirPath), DATADIR_VERSION, 'utf8')

const createNodeDatadir = async (datadirPath: string): Promise<void> => {
  await fs.mkdir(datadirPath, {recursive: true})
  await createVersionFile(datadirPath)
}
interface DatadirCompatibility {
  isCompatible: boolean
  datadirVersion: string
}

const checkDatadirVersion = async (datadirPath: string): Promise<DatadirCompatibility> => {
  try {
    // load node datadir version.txt and check if it's compatible
    const datadirVersion = (await fs.readFile(getVersionFilePath(datadirPath), 'utf8')).trim()
    const coercedVersion = coerce(datadirVersion)
    const isCompatible = satisfies(coercedVersion || datadirVersion, COMPATIBLE_VERSIONS)

    console.info(
      `Data dir version: ${datadirVersion} (${coercedVersion})\n` +
        `Compatible versions: ${COMPATIBLE_VERSIONS}\n` +
        `Compatible? ${isCompatible}`,
    )

    return {
      isCompatible,
      datadirVersion,
    }
  } catch (e) {
    if (e.code === 'ENOENT') {
      // doesn't contain a version.txt: incompatible
      return {
        isCompatible: false,
        datadirVersion: NO_VERSION,
      }
    } else {
      console.error(e)
      // abort in case the problem is not that version.txt doesn't exist
      throw e
    }
  }
}

const initNodeDatadir = async (datadirPath: string): Promise<DatadirCompatibility> => {
  try {
    // check if data directory exists
    await fs.access(datadirPath, fsConstants.W_OK | fsConstants.R_OK)
  } catch (e) {
    // if datadir doesn't exist, initialize new one with version.txt
    await createNodeDatadir(datadirPath)
    return {
      isCompatible: true,
      datadirVersion: DATADIR_VERSION,
    }
  }

  const isDataDirEmpty = await isDirEmpty(datadirPath)

  // datadir already exists and is empty: we can use it after creating version.txt
  if (isDataDirEmpty) {
    await createVersionFile(datadirPath)
    return {
      isCompatible: true,
      datadirVersion: DATADIR_VERSION,
    }
  }

  // non-empty datadir
  return checkDatadirVersion(datadirPath)
}

const CANCELLED_BY_USER = Error('Cancelled by user')

type NoVersionAction = 'VERSION_ADDED' | 'MOVE_DELETE'

const handleNoVersion = async (
  window: BrowserWindow,
  t: TFunctionMain,
  datadirPath: string,
): Promise<NoVersionAction> => {
  const {response} = await dialog.showMessageBox(window, {
    type: 'error',
    buttons: [
      t(['dialog', 'noVersionTxt', 'addVersionTxt']),
      t(['dialog', 'noVersionTxt', 'moveDelete']),
      t(['dialog', 'button', 'abort']),
    ],
    title: t(['dialog', 'noVersionTxt', 'title']),
    message: t(['dialog', 'noVersionTxt', 'message']),
    detail: t(['dialog', 'noVersionTxt', 'detail']),
  })

  switch (response as 0 | 1 | 2) {
    case 0: {
      await createVersionFile(datadirPath)
      return 'VERSION_ADDED'
    }
    case 1: {
      return 'MOVE_DELETE'
    }
    case 2: {
      throw CANCELLED_BY_USER
    }
  }
}

const handleIncompatibleDatadir = async (
  window: BrowserWindow,
  t: TFunctionMain,
  datadirPath: string,
  datadirVersion: string,
): Promise<CheckedDatadir> => {
  if (datadirVersion == NO_VERSION) {
    const noVersionAction = await handleNoVersion(window, t, datadirPath)
    if (noVersionAction == 'VERSION_ADDED') {
      return new CheckedDatadir(datadirPath, Checked)
    }
  }

  const oldDirName = path.basename(datadirPath)
  const newDirName = `${oldDirName}-${datadirVersion}`

  const {checkboxChecked, response} = await dialog.showMessageBox(window, {
    type: 'error',
    buttons: [t(['dialog', 'button', 'ok']), t(['dialog', 'button', 'abort'])],
    title: t(['dialog', 'title', 'incompatibleDataDir']),
    message: t(['dialog', 'message', 'incompatibleDataDir']),
    detail: t(['dialog', 'message', 'incompatibleDataDirAction'], {
      replace: {oldDirName, newDirName},
    }),
    checkboxLabel: t(['dialog', 'checkboxLabel', 'deleteCurrentDataDir']),
    checkboxChecked: false,
  })

  if (response === 1) {
    // Cancel launch
    throw CANCELLED_BY_USER
  }

  if (checkboxChecked) {
    // Delete confirmation
    const {response} = await dialog.showMessageBox(window, {
      type: 'warning',
      buttons: [t(['dialog', 'button', 'ok']), t(['dialog', 'button', 'abort'])],
      message: t(['dialog', 'message', 'deleteDatadirConfirmation'], {
        replace: {directory: datadirPath},
      }),
    })
    if (response === 1) {
      // Cancel delete
      throw CANCELLED_BY_USER
    }

    // Actually delete datadir
    await promisify(rimraf)(datadirPath)
  } else {
    // Rename option
    const parent = path.dirname(datadirPath)
    const newDatadirPath = path.join(parent, newDirName)
    await fs.rename(datadirPath, newDatadirPath)
  }

  // Initialize new datadir with version.txt
  await createNodeDatadir(datadirPath)

  await dialog.showMessageBox(window, {
    message: t(['dialog', 'message', 'operationComplete']),
    buttons: [t(['dialog', 'button', 'ok'])],
  })
  return new CheckedDatadir(datadirPath, Checked)
}

export const checkNodeDatadir = async (
  window: BrowserWindow,
  t: TFunctionMain,
  datadirPath: string,
): Promise<CheckedDatadir> => {
  const {isCompatible, datadirVersion} = await initNodeDatadir(datadirPath)
  return isCompatible
    ? new CheckedDatadir(datadirPath, Checked)
    : handleIncompatibleDatadir(window, t, datadirPath, datadirVersion)
}

export const selectDatadirLocation = async (
  window: BrowserWindow,
  t: TFunctionMain,
  defaultPath: string,
): Promise<string> => {
  const {response: startResponse} = await dialog.showMessageBox(window, {
    type: 'warning',
    title: t(['dialog', 'selectDatadir', 'openDialogTitle']),
    message: t(['dialog', 'selectDatadir', 'selectMantisDatadir']),
    detail: t(['dialog', 'selectDatadir', 'freeSpaceWarning']),
    buttons: [t(['dialog', 'button', 'ok']), t(['dialog', 'button', 'abort'])],
  })
  if (startResponse == 1) throw CANCELLED_BY_USER

  const {canceled, filePaths} = await dialog.showOpenDialog(window, {
    title: t(['dialog', 'selectDatadir', 'openDialogTitle']),
    buttonLabel: t(['dialog', 'button', 'selectDirectory']),
    properties: ['openDirectory', 'createDirectory', 'showHiddenFiles'],
    defaultPath: defaultPath,
  })
  if (canceled) throw CANCELLED_BY_USER

  // sanitize selected location
  const newDataDirPath = path.basename(filePaths[0]).startsWith(NODE_DIR_NAME)
    ? filePaths[0]
    : path.join(filePaths[0], NODE_DIR_NAME)

  const {response: confirmationResponse} = await dialog.showMessageBox(window, {
    type: 'info',
    message: `${t(['dialog', 'selectDatadir', 'newPathConfirmation'])}\n${newDataDirPath}`,
    buttons: [t(['dialog', 'button', 'ok']), t(['dialog', 'button', 'selectOtherLocation'])],
  })

  if (confirmationResponse === 1) {
    // Select other:
    return selectDatadirLocation(window, t, defaultPath)
  }

  return newDataDirPath
}

// If mantis.dataDir is set in config, it overrides the value set on the UI
export const getMantisDatadirPath = (config: Config, store: MainStore): string =>
  config.mantis.dataDir ?? store.get('settings.mantisDatadir')
