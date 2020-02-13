import {remote, webFrame} from 'electron'
import {Config} from './type'

export const config: Config = remote.getGlobal('lunaConfig')

// Set default zoom factor
webFrame.setZoomFactor(0.8)
