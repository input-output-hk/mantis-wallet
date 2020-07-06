import path from 'path'
import _ from 'lodash/fp'
import {config} from '../config/main'
import {createLogger} from '../shared/utils'

export const mainLog = createLogger('main', () => path.join(config.dataDir, 'logs', 'main.log'))

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
