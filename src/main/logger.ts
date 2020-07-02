import path from 'path'
import {config} from '../config/main'
import {createLogger} from '../shared/utils'

export const mainLog = createLogger('main', () => path.join(config.dataDir, 'logs', 'main.log'))
