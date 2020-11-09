import path from 'path'
import _ from 'lodash/fp'
import ElectronLog from 'electron-log'
import {config} from '../config/main'
import {createLogger} from '../shared/utils'
import {MainStore} from './store'
import {DatadirChecked} from './compatibility-check'

export const createMainLog = (
  _datadirChecked: DatadirChecked,
  store: MainStore,
): ElectronLog.ElectronLog => {
  const mainLog = createLogger('main', () =>
    path.join(config.dataDir, 'logs', store.get('networkName'), 'main.log'),
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
