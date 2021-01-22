import path from 'path'
import _ from 'lodash/fp'
import {ElectronLog} from 'electron-log'
import {createLogger} from '../shared/utils'
import {Config} from '../config/type'
import {CheckedDatadir, getMantisDatadirPath} from './data-dir'
import {MainStore} from './store'

export const createMainLog = (
  _checkedDatadir: CheckedDatadir,
  store: MainStore,
  config: Config,
): ElectronLog => {
  const mainLog = createLogger('main', () =>
    path.join(getMantisDatadirPath(config, store), store.get('networkName'), 'logs', 'main.log'),
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
