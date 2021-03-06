import path from 'path'
import {config} from '../config/renderer'
import {createLogger} from '../shared/utils'

export const rendererLog = createLogger('renderer', () =>
  path.join(config.walletDataDir, 'logs', 'renderer.log'),
)
