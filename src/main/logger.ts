import path from 'path'
import _ from 'lodash/fp'
import {ElectronLog} from 'electron-log'
import {createLogger} from '../shared/utils'
import {CheckedDatadir} from './data-dir'
import {MainStore} from './store'

export const createMainLog = (checkedDatadir: CheckedDatadir, store: MainStore): ElectronLog => {
  const mainLog = createLogger('main', () =>
    path.join(checkedDatadir.datadirPath, 'logs', store.get('networkName'), 'main.log'),
  )

  // eslint-disable-next-line fp/no-mutating-methods
  mainLog.hooks.push((message, transport) => {
    if (transport !== mainLog.transports.console) {
      return message
    }

    return {
      ...message,
      data: message.data.map((v) => (_.isPlainObject(v) ? JSON.stringify(v, null, 2) : v)),
    }
  })

  return mainLog
}
