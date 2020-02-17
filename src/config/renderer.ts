import {remote} from 'electron'
import {Config} from './type'

export const config: Config = remote.getGlobal('lunaConfig')
